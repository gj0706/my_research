import argparse
import connexion
import numpy as np
import os
import yaml
from flask import send_from_directory, redirect

from lstmdata.data_handler import LSTMDataHandler
import lstmdata.read_index as ri

__author__ = 'Hendrik Strobelt'

CONFIG_FILE_NAME = 'lstm.yml'
data_handlers = {}
index_map = {}

app = connexion.App(__name__, debug=True)


def get_context(**request):
    '''

    :param request: 'request' in lstm_server.yaml
    eg.: "request": {
    "activation": 0.3,
    "cells": [
      2
    ],
    "dims": [
      "states",
      "words"
    ],
    "left": 3,
    "pos": [
      12
    ],
    "project": "ptb_word",
    "right": 3,
    "source": "states::states1",
    "transform": "tanh"
  }
    :return:
    '''
    project = request['project']
    if project not in data_handlers:
        return 'No such project', 404
    else:
        dh = data_handlers[project]  # type: LSTMDataHandler

        # check if source is exists
        if not dh.is_valid_source(request['source']):
            return 'No valid source. Valid are: ' + ' -- '.join(dh.valid_sources()), 404

        # cell selection by bitmask vs. cell array
        cells = []
        if 'bitmask' in request:
            cells = np.where(np.fromstring(request['bitmask'], dtype=np.uint8) > 48)[0].tolist()
        elif 'cells' in request:
            cells = request['cells']

        res = dh.get_dimensions(
            pos_array=request['pos'],
            source=request['source'],
            left=request['left'],
            right=request['right'],
            dimensions=request['dims'],
            data_transform=request['transform'],
            cells=cells,
            activation_threshold=request['activation']
        )
        res['cells'] = cells

        return {'request': request, 'results': res}


def get_info():
    res = []
    for key, project in data_handlers.iteritems():
        # print key
        res.append({
            'project': key,
            'info': project.config
        })
    return sorted(res, key=lambda x: x['project'])


def search(**request):
    project = request['project']
    res = {}

    if project not in data_handlers:
        return 'No such project', 404

    else:
        # start search either using index or regex

        dh = data_handlers[project]
        if project in index_map:
            res = ri.query_index(request['q'], request['limit'], request['html'],
                                 dir=index_map[project])
        elif dh.config['etc']['regex_search']:
            res = dh.regex_search(request['q'], request['limit'], request['html'])

    return {'request': request, 'res': res}


def match(**request):
    project = request['project']
    res = {}

    if project not in data_handlers:
        return 'No such project', 404

    else:
        dh = data_handlers[project]  # type: LSTMDataHandler

        # check if source is exists
        if not dh.is_valid_source(request['source']):
            return 'No valid source', 404

        ranking, meta = dh.query_similar_activations(
            source=request['source'],
            cells=request['cells'],
            activation_threshold=request['activation'],
            data_transform=request['transform'],
            phrase_length=request['phrase_length'],
            add_histograms=True,
            query_mode=request['mode'],
            constrain_left=request['constraints'][0] > 0,
            constrain_right=request['constraints'][1] > 0
        )

        request_positions = map(lambda x: x['pos'], ranking)
        position_details = dh.get_dimensions(
            pos_array=request_positions,
            source=request['source'],
            left=request['left'],
            right=request['right'],
            cells=request['cells'],
            dimensions=request['dims'],
            data_transform=request['transform'],
            activation_threshold=request['activation']
        )

        res = {
            'rankingDetail': ranking,
            'positionDetail': position_details,
            'fuzzyLengthHistogram': meta['fuzzy_length_histogram'].tolist(),
            'strictLengthHistogram': meta['strict_length_histogram'].tolist()
        }

        return {'request': request, 'results': res}


@app.route('/client/<path:path>') # Route: a mapping of URLs to Python functions
def send_static(path): # View function: function that handles application URL
    """ serves all files from ./client/ to ``/client/<path:path>``

    :param path: path from api call
    """
    return send_from_directory('client/', path)

@app.route('/')
def redirect_home():
    return redirect('/client/index.html', code=302)


def create_data_handlers(directory):
    """
    searches for CONFIG_FILE_NAME in all subdirectories of directory
    and creates data handlers for all of them

    :param directory: scan directory
    :return: null
    """
    project_dirs = []
    # os.walk: iterate all the files and folders under a top directory, returns a 3-element tuple of (root, dirs, files)
    # root: current directory, dirs: a list of sub directories, files: a list of sub files
    for root, dirs, files in os.walk(directory):
        if CONFIG_FILE_NAME in files:
            project_dirs.append(os.path.abspath(root)) # os.path.abspath(path) returns the absolute path of 'lstm.yml'

    i = 0
    for p_dir in project_dirs:
        with open(os.path.join(p_dir, CONFIG_FILE_NAME), 'r') as yf:
            config = yaml.load(yf) # config now is a dictionary
            dh_id = os.path.split(p_dir)[1] # '05childbook'
            data_handlers[dh_id] = LSTMDataHandler(directory=p_dir, config=config)
            if data_handlers[dh_id].config['index']:
                index_map[dh_id] = data_handlers[dh_id].config['index_dir'] # {'05childbook': '/Users/jaywang/Documents/TTU_study/Fall2019/LSTMVis/data/05childbook/05childbook/indexdir'}
        i += 1


app.add_api('lstm_server.yaml')

parser = argparse.ArgumentParser()
parser.add_argument("--nodebug", default=False)
parser.add_argument("--port", default="8080")
parser.add_argument("--nocache", default=False)
parser.add_argument("-dir", type=str, default=os.path.abspath('data'))

if __name__ == '__main__':
    args = parser.parse_args()
    app.run(port=int(args.port), debug=not args.nodebug, host="0.0.0.0")
else:
    args, _ = parser.parse_known_args()
    create_data_handlers(args.dir)

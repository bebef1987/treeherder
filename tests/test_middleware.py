import pytest

from treeherder.middleware import IMMUTABLE_FILE_RE

URLS_IMMUTABLE = [
    '/assets/13.0cb55c2c.js',
    '/assets/2.379789df.css',
    '/assets/dancing_cat.fa5552a5.gif',
    '/assets/fontawesome-webfont.fee66e71.woff',
    '/assets/fontawesome-webfont.fee66e71.woff.gz',
    '/assets/fontawesome-webfont.af7ae505.woff2',
    '/assets/fontawesome-webfont.af7ae505.woff2.br',
    '/assets/index.1d85033a.js',
    '/assets/index.1d85033a.js.br',
    '/assets/index.1d85033a.js.map',
    '/assets/index.1d85033a.js.map.gz',
    '/assets/perf.d7fea1e4.css',
    '/assets/perf.d7fea1e4.css.gz',
    '/assets/perf.d7fea1e4.css.map',
    '/assets/perf.d7fea1e4.css.map.br',
]

URLS_NOT_IMMUTABLE = [
    '/',
    '/contribute.json',
    '/perf.html',
    '/revision.txt',
    '/tree_open.png',
    '/abc.12345678.js',
    '/static/debug_toolbar/assets/toolbar.css',
    '/static/rest_framework/docs/js/jquery.json-view.min.js',
]


@pytest.mark.parametrize('url', URLS_IMMUTABLE)
def test_immutable_file_regex_matches(url):
    assert IMMUTABLE_FILE_RE.match(url) is not None


@pytest.mark.parametrize('url', URLS_NOT_IMMUTABLE)
def test_immutable_file_regex_does_not_match(url):
    assert IMMUTABLE_FILE_RE.match(url) is None

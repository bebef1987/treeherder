import re

import newrelic.agent
from django.utils.deprecation import MiddlewareMixin
from whitenoise.middleware import WhiteNoiseMiddleware

# Matches Neutrino's style of hashed filenames, eg:
#   assets/index.1d85033a.js.gz
#   assets/2.379789df.css.map.br
#   assets/fontawesome-webfont.af7ae505.woff2
IMMUTABLE_FILE_RE = re.compile(r'/assets/.*')


class CustomWhiteNoise(WhiteNoiseMiddleware):
    """Sets long max-age headers for Neutrino-generated hashed files."""

    def immutable_file_test(self, path, url):
        # If the URL matches the Neutrino hashed filename style, it's
        # safe to tell WhiteNoise that the contents will never change.
        if IMMUTABLE_FILE_RE.match(url):
            return True
        # Otherwise fall back to the default method, so we catch filenames in the
        # style output by GzipManifestStaticFilesStorage during collectstatic. eg:
        #   bootstrap.min.abda843684d0.js
        return super(CustomWhiteNoise, self).immutable_file_test(path, url)


class NewRelicMiddleware(MiddlewareMixin):
    """Adds custom annotations to New Relic web transactions."""

    def process_request(self, request):
        # The New Relic Python agent only submits the User Agent to APM (for exceptions and
        # slow transactions), so for use in Insights we have to add it as a customer parameter.
        if 'HTTP_USER_AGENT' in request.META:
            newrelic.agent.add_custom_parameter('user_agent', request.META['HTTP_USER_AGENT'])

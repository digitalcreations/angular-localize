/* global angular */

(function () {
    'use strict';

    angular.module('localize', ['ngSanitize'])

        // SECURITY CONTEXT:
        // This simple filter only properly sanitizes values
        // that are printed between HTML tags, e.g.
        // <div>ESCAPED_CONTENT</div>
        // It will fall short when used in any other context,
        // e.g. within attributes not enclosed by double quotes
        // or as value for event handlers or href attributes:
        // https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)
        .filter('escapeHTML', function () {
            var config = {
                encReg: /[<>&"]/g,
                encMap: {
                    '<' : '&lt;',
                    '>' : '&gt;',
                    '&' : '&amp;',
                    '"' : '&quot;'
                },
                encFunc: function (c) {
                    return config.encMap[c];
                }
            };
            return function (str) {
                return String(str).replace(
                    config.encReg,
                    config.encFunc
                );
            };
        })

        .factory('i18n', ['$window', function ($window) {
            return $window.i18n;
        }])

        .factory('localize', [
            '$filter', 'i18n',
            function ($filter, i18n) {
                return function (key, data, escape) {
                    var func = i18n[key],
                        escapedData;
                    if (func) {
                        if (escape) {
                            escapedData = {};
                            angular.forEach(data, function (value, key) {
                                escapedData[key] = $filter('escapeHTML')(value);
                            });
                        }
                        return func(escapedData || data);
                    }
                    return key;
                };
            }
        ])

        .directive('localize', [
            '$sanitize', '$filter', 'i18n',
            function ($sanitize, $filter, i18n) {
                return function (scope, elm, attrs) {
                    // Take the translation key from the element content
                    // if the localize attribute is empty:
                    var key = attrs.localize || elm.html(),
                        func = i18n[key],
                        isInput = /input|textarea/i.test(elm.prop('nodeName')),
                        data,
                        update,
                        hasObservers;
                    if (func) {
                        if (isInput) {
                            update = function () {
                                elm.attr('placeholder', func(attrs));
                            };
                        } else if (attrs.localize) {
                            // Localization is text only
                            update = function () {
                                elm.text(func(attrs));
                            };
                        } else {
                            // Localization can contain HTML
                            data = {};
                            update = function (key, value) {
                                if (key) {
                                    data[key] = $filter('escapeHTML')(value);
                                }
                                elm.html($sanitize(func(data)));
                            };
                        }
                        angular.forEach(attrs.$attr, function (attr, normAttr) {
                            // Only observe non-directive data-attributes:
                            if (/^data-(?!ng-|localize)/.test(attr)) {
                                attrs.$observe(
                                    normAttr,
                                    isInput || attrs.localize ? update :
                                        function (value) {
                                            update(normAttr, value);
                                        }
                                );
                                hasObservers = true;
                            }
                        });
                        if (!hasObservers) {
                            update();
                        }
                    } else if (attrs.localize) {
                        // If there is no translation function,
                        // the key itself is the translation value:
                        if (isInput) {
                            elm.attr('placeholder', key);
                        } else {
                            elm.text(key);
                        }
                    }
                };
            }
        ]);

}());

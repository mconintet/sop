define({
    name: 'sop.Template',
    init: function () {
        /**
         * Supports a php style template in javascript
         *
         * @memberof sop
         * @param strTpl {String} Template string
         * @param debug {Boolean} Flag of debug
         * @constructor
         */
        var Template = function (strTpl, debug) {
            this.strTpl = strTpl || '';
            this.cTpl = null;
            this.debug = debug || false;

            this.syntaxReg = /\{\{([^{}]+)\}\}/g;
        };

        Template._syntaxDict = {
            'if(.*):': new RegExp('^if(.*):$'),
            'else if(.*):': new RegExp('^else if(.*):$'),
            'else:': new RegExp('^else:$'),
            'endif;': new RegExp('^endif;$'),
            'for(.*):': new RegExp('^for(.*):$'),
            'endfor;': new RegExp('^endfor;$')
        };

        Template.prototype._getSyntax = function (str) {
            var syntaxDict = Template._syntaxDict;
            var ret = '';

            for (var p in syntaxDict) {
                if (syntaxDict.hasOwnProperty(p)) {
                    if (syntaxDict[p].test(str)) {
                        ret = p;
                        break;
                    }
                }
            }

            return ret;
        };

        Template.prototype._translateSyntax = function (str) {
            var that = this;

            return str.replace(this.syntaxReg, function (m, p1) {
                var syntax = that._getSyntax(p1.replace(/^\s*|\s*$/g, ''));
                var part1 = '';
                var isDefOutput = false;

                switch (syntax) {
                    case 'if(.*):':
                        part1 = p1.replace('):', '){');
                        break;
                    case 'else if(.*):':
                        part1 = p1.replace('else', '}else').replace('):', '){');
                        break;
                    case 'else:':
                        part1 = p1.replace('else', '}else').replace(':', '{');
                        break;
                    case 'endif;':
                        part1 = '}';
                        break;
                    case 'for(.*):':
                        part1 = p1.replace('):', '){');
                        break;
                    case 'endfor;':
                        part1 = '}';
                        break;
                    default :
                        part1 = p1;
                        if (part1.indexOf('=') == -1) {
                            isDefOutput = true;
                        }
                        break;
                }

                if (isDefOutput) {
                    return 'output += ' + part1 + ';';
                } else {
                    return part1;
                }
            });
        };

        Template.prototype._translateNormal = function (str) {
            return "output += '" + str.replace(/\r{0,1}\n/g, '').replace(/'/g, "\\'") + "';";
        };

        Template.prototype._makeFnContentBody = function (str) {
            if (this.syntaxReg.test(str)) {
                var matches, startIndex = 0, items = [], regex = this.syntaxReg, normal = '', syntax = '', len = str.length;
                regex.lastIndex = 0;

                while ((matches = regex.exec(str)) !== null && startIndex < len) {
                    normal = str.slice(startIndex, matches.index);
                    syntax = str.slice(matches.index, regex.lastIndex);

                    normal = this._translateNormal(normal);

                    /**
                     * in the invoking 'this._translateSyntax(syntax)' we use the function String.replace,
                     * it uses the same Regexp 'this.syntaxReg' as we are using here. after calling the String.replace, it
                     * will reset the lastIndex of the Regexp 'this.syntaxReg', so we need to save the lastIndex and reset it
                     * to before calling the String.replace
                     */
                    startIndex = regex.lastIndex;
                    syntax = this._translateSyntax(syntax);
                    regex.lastIndex = startIndex;

                    items.push(normal);
                    items.push(syntax);
                }

                if (startIndex > 0 && startIndex < len) {
                    normal = str.slice(startIndex, len);
                    normal = this._translateNormal(normal);
                    items.push(normal);
                }

                return items;
            }

            return [this._translateNormal(str)];
        };

        Template.prototype._process = function () {
            var fnContentHeader = 'context = context || {}; var output = \'\';';
            var fnContentBody = this._makeFnContentBody(this.strTpl).join('\n');
            var fnContentFooter = 'return output;';

            var fnContent = fnContentHeader + fnContentBody + fnContentFooter;

            if (this.debug) {
                console.log(fnContent);
            }

            var processed = new Function(['context'], fnContent);
            this.cTpl = new Template.CTpl(processed);
        };

        /**
         * Gets compiled template instance
         *
         * @returns {sop.Template.CTpl}
         */
        Template.prototype.getCTpl = function () {
            if (this.cTpl === null) {
                this._process();
            }

            return this.cTpl;
        };

        /**
         * Compiled template
         *
         * @param processed {Function} Compiled function
         * @constructor
         */
        Template.CTpl = function (processed) {
            this.processed = processed;
        };

        /**
         * Renders template with given context
         *
         * @memberof sop.Template.CTpl
         * @function sop.Template.CTpl.prototype.render
         * @param context {Object} Context within render
         * @returns {String} Rendered string
         */
        Template.CTpl.prototype.render = function (context) {
            return this.processed(context);
        };

        return Template;
    }
});

define({
    name: 'sop.Template',
    init: function () {
        var txt = document.createElement("textarea");
        var decodeHtml = function (html) {
            txt.innerHTML = html;
            return txt.value;
        };

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

            this.syntaxReg = /\{\{([\s\S]*?)(?=\}\})/g;

            this.strTpl = decodeHtml(this.strTpl);
        };

        Template.prototype._translateSyntax = function (str) {
            if(/if\(.*\):/.test(str)){
                return str.replace('):', '){');
            }

            if(/else if\(.*\):/.test(str)){
                return str.replace('else', '}else').replace('):', '){');
            }

            if(/else:/.test(str)){
                return str.replace('else', '}else').replace(':', '{');
            }

            if(/endif;/.test(str)){
                return str.replace('endif;', '}');
            }

            if(/for\(.*\):/.test(str)){
                return str.replace('):', '){');
            }

            if(/endfor;/.test(str)){
                return str.replace('endfor;', '}');
            }

            return str;
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
                    syntax = str.slice(matches.index + 2, regex.lastIndex);

                    normal = this._translateNormal(normal);

                    /**
                     * in the invoking 'this._translateSyntax(syntax)' we use the function String.replace,
                     * it uses the same Regexp 'this.syntaxReg' as we are using here. after calling the String.replace, it
                     * will reset the lastIndex of the Regexp 'this.syntaxReg', so we need to save the lastIndex and reset it
                     * to before calling the String.replace
                     */
                    startIndex = regex.lastIndex + 2;
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
            var fnContentHeader = 'context = context || {}; var output = \'\'; var echo = function (str) { output+=str; };';
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
         *     var tpl = 'hello, {{ context.name }}';
         *
         *     // here use `true` to output debug information into console
         *     var cTpl = new sop.Template(tpl, true).getCTpl();
         *
         *     var context = { name : 'world' };
         *
         *     console.log(cTpl.render(context));
         *     // output => hello, world
         *
         * @memberof sop.Template.CTpl
         * @function sop.Template.CTpl.prototype.render
         * @param context {Object} Context within render
         * @param {Object} [thisObj={}] The "this" reference within render function, default is an new empty object
         * @returns {String} Rendered string
         */
        Template.CTpl.prototype.render = function (context, thisObj) {
            return this.processed.call(thisObj || {}, context);
        };

        /**
         * Decodes html string
         *
         *     var decoded = Template.decodeHtml('&amp;amp;&amp;amp;');
         *     // decoded => &&
         *
         * @function sop.Template.decodeHtml
         * @param html {String} Html string to be decoded
         * @returns {String} Decoded string
         */
        Template.decodeHtml = decodeHtml;

        return Template;
    }
});

define({
    name: 'sop.Validation',
    init: function () {
        var defaultConfig = {
            form: '',
            children: [
                {
                    target: '',
                    validate: function (value, element) {
                    },
                    onError: function (value, element) {
                    }
                }
            ],
            afterValidate: function (isValid, failedValidators) {
            }
        };

        var Validation = function (config) {
            this.config = {};
            $.extend(this.config, defaultConfig, config || {});

            this.form = typeof this.config.form === 'string' ? $(this.config.form) : this.config.form;
        };

        Validation.prototype.validate = function (stopWhenError) {
            stopWhenError = stopWhenError || false;

            var children = this.config.children,
                i = 0,
                len = children.length,
                child,
                target,
                validate,
                onError,
                isValid = true,
                isChildValid,
                j, k, element, failedValidators = [];

            for (; i < len; i++) {
                child = children[i];
                target = child['target'];
                validate = child['validate'];
                onError = child['onError'];

                if (typeof target === 'string') {
                    target = this.form.find(target);
                }

                isChildValid = true;
                for (j = 0, k = target.length; j < k; j++) {
                    element = target[j];

                    if (typeof validate === 'function' && !validate($(element).val(), element)) {
                        typeof onError === 'function' && onError($(element).val(), element);

                        isChildValid = false;
                        failedValidators.push(child);
                    }
                }

                if (isChildValid === false) {
                    isValid = false;

                    if (stopWhenError)
                        break;
                }
            }

            this.config.afterValidate(isValid, failedValidators);
            return isValid;
        };

        return Validation;
    }
});
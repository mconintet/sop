define({
    name: 'hello.world',
    init: function () {
        console.log('hello init');

        return {
            print: function () {
                console.log('hello world');
            }
        };
    }
});

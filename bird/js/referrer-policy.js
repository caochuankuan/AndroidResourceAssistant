(function () {
    const originalFetch = window.fetch;

    if (!originalFetch) {
        return;
    }

    window.fetch = function (input, init) {
        const options = init ? { ...init } : {};

        if (!options.referrerPolicy) {
            options.referrerPolicy = 'no-referrer';
        }

        return originalFetch.call(this, input, options);
    };
})();

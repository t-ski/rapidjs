assert("Simple GET request (example.org)", {
    url: "https://example.org/test"
}, {
    status: 404,
    headers: {
        "Content-Length": 1256,
        "Content-Type": "text/html; charset=UTF-8"
    },
    //message: "<!doctype html> <html> ABC </html>",
    ignoreWhitespace: true
});
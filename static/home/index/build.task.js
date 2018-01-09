module.exports = [
  {
    "type": "third",
    "src": [
      "home/index/third/**/*"
    ]
  },
  {
    "type": "res",
    "src": [
      "home/index/res/**/*"
    ]
  },
  {
    "type": "css",
    "src": [
        "home/index/css/**/*.scss"
    ]
  },
  {
    "type" : "views",
    "views": false,
    "src": [
        "home/index/**/*.pug"
    ]
  },
  {
    "type" : "js",
    "src": [
        "home/index/js/**/app.es6"
    ],
    "watch": [
        "home/index/js/**/*.es6"
    ]
  }
]
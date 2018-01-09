module.exports = [
  {
    "type": "third",
    "src": [
      "${app}/index/third/**/*"
    ]
  },
  {
    "type": "res",
    "src": [
      "${app}/index/res/**/*"
    ]
  },
  {
    "type": "css",
    "src": [
        "${app}/index/css/**/*.scss"
    ]
  },
  {
    "type" : "views",
    "views": false,
    "src": [
        "${app}/index/**/*.pug"
    ]
  },
  {
    "type" : "js",
    "src": [
        "${app}/index/js/**/app.es6"
    ],
    "watch": [
        "${app}/index/js/**/*.es6"
    ]
  }
]
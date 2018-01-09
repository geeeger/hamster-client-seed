module.exports = [
    {
      "type": "third",
      "src": [
        "common/third/**/*"
      ]
    },
    {
      "type": "res",
      "src": [
        "common/res/**/*"
      ]
    },
    {
      "type": "css",
      "src": [
          "common/css/**/*.scss"
      ]
    },
    {
      "type": "js",
      "src": [
          "common/js/**/app.es6"
      ],
      "watch": [
          "common/js/**/*.es6"
      ]
    },
    {
      "type": "third",
      "src": [
          "common/js/**/*.js"
      ]
    },
    {
      "type": "views",
      "src": [
          "common/views/**/*.pug"
      ]
    }
  ]
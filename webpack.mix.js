let mix = require('laravel-mix');

mix.setPublicPath('./')
    .sass('src/scss/popup.scss', 'dist/css')
    .js('src/js/content.js', 'dist/js')
    .js('src/js/background.js', 'dist/js')
    .js('src/js/popup.js', 'dist/js').vue()
    .options({
        processCssUrls:false
    });
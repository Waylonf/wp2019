/**
 * Getting up and ready
 *
 * 1. Install node: Visit the node.js website for the latest installer.
 * 2. Install Gulp: Run "npm install --global gulp-cli"
 * 3. Install Browser-Sync: Run "npm install -g browser-sync"
 * 3. Install dependancies. Make sure that  Node.js and Browser-Sync are installed. Then run "npm install"
 * 4. Update browser-sync options to reflect your environment in the file "gulpfile.js"
 * 5. Run "gulp watch-bs" to compile files and and update browser as files are edited. 
 */

// Defining requirements
var gulp         = require( 'gulp' );
var plumber      = require( 'gulp-plumber' );
var sass         = require( 'gulp-sass' );
var watch        = require( 'gulp-watch' );
var rename       = require( 'gulp-rename' );
var concat       = require( 'gulp-concat' );
var uglify       = require( 'gulp-uglify' );
var imagemin     = require( 'gulp-imagemin' );
var ignore       = require( 'gulp-ignore' );
var rimraf       = require( 'gulp-rimraf' );
var sourcemaps   = require( 'gulp-sourcemaps' );
var browserSync  = require( 'browser-sync' ).create();
var del          = require( 'del' );
var cleanCSS     = require( 'gulp-clean-css' );
var gulpSequence = require( 'gulp-sequence' );
var replace      = require( 'gulp-replace' );
var autoprefixer = require( 'gulp-autoprefixer' );
var cfg          = require( './gulpconfig.json' );
var trimlines    = require( 'gulp-trimlines' );
//var replace      = require( 'gulp-replace' );
var paths        = cfg.paths;
//var themeInfo    = require( './package.json' );

// Read data from 'package.json' for use.
var fs          = require( 'fs');
var json        = JSON.parse(fs.readFileSync('./package.json'));

// Date info
var d           = new Date();
var thedate     = ' '+d.getDate()+'-'+d.getMonth()+'-'+d.getFullYear()+' '+d.getHours()+'H'+d.getMinutes()+'-'+d.getSeconds();

// Function to format strings used in 'stylesheetSetup'
function titleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Date function used in 'zipTheme'
var versionDate = new Date();

// Info for styles.css
var themeInfo   = {
    themeName           : json.name,
    themeLink           : json.repository.url,
    themeAuthor         : json.author,
    themeAuthorLink     : json.homepage,
    themeDescription    : json.description,
    themeVersion        : json.version,
    textDomain          : json.name,
    themeTags           : json.keywords,
};

// Update stylesheet header.
/*gulp.task('stylesheetSetup', function() {
    gulp.src('./styles.css')
    //.pipe(plumber({ errorHandler: function(err) { notify.onError({ title: "Gulp error in " + err.plugin, message:  err.toString() })(err); gutil.beep(); }}))
    .pipe(replace('{THEME-NAME}', titleCase(themeInfo.themeName)))
    .pipe(replace('{THEME-LINK}', themeInfo.themeLink))
    .pipe(replace('{THEME-AUTHOR}', titleCase(themeInfo.themeAuthor)))
    .pipe(replace('{THEME-AUTHOR-LINK}', themeInfo.themeAuthorLink))
    .pipe(replace('{THEME-DESCRIPTION}', themeInfo.themeDescription))
    .pipe(replace('{THEME-VERSION}', themeInfo.themeVersion))
    .pipe(replace('{THEME-TAGS}', themeInfo.themeTags))
    .pipe(replace('{TEXTDOMAIN}', themeInfo.textDomain))
    .pipe(trimlines({leading: false}))
    .pipe(gulp.dest('./'))
    //.pipe(notify({message: 'Stylesheet header has been populated',onLast:true}))
});*/

// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task( 'sass', function() {
    var stream = gulp.src( paths.sass + '/theme.scss' )
        .pipe( plumber( {
            errorHandler: function( err ) {
                console.log( err );
                this.emit( 'end' );
            }
        } ) )
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe( sass( { errLogToConsole: true } ) )
        .pipe( autoprefixer( 'last 2 versions' ) )
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe( gulp.dest( paths.css ) )
    return stream;
});

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task( 'watch', function() {
    gulp.watch( paths.sass + '/**/*.scss', ['styles'] );
    gulp.watch( [paths.dev + '/js/**/*.js', 'js/**/*.js', '!js/theme.js', '!js/theme.min.js'], ['scripts'] );

    //Inside the watch task.
    gulp.watch( paths.imgsrc + '/**', ['imagemin-watch'] );
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 * @verbose
 */
gulp.task( 'imagemin-watch', ['imagemin'], function( ) {
  browserSync.reload();
});

// Run:
// gulp imagemin
// Running image optimizing task
gulp.task( 'imagemin', function() {
    gulp.src( paths.imgsrc + '/**' )
    .pipe( imagemin() )
    .pipe( gulp.dest( paths.img ) );
});

// Run:
// gulp cssnano
// Minifies CSS files
gulp.task( 'cssnano', function() {
  return gulp.src( paths.css + '/theme.css' )
    .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( plumber( {
            errorHandler: function( err ) {
                console.log( err );
                this.emit( 'end' );
            }
        } ) )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( cssnano( { discardComments: { removeAll: true } } ) )
    .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( paths.css ) );
});

gulp.task( 'minifycss', function() {
  return gulp.src( paths.css + '/theme.css' )
  .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( cleanCSS( { compatibility: '*' } ) )
    .pipe( plumber( {
            errorHandler: function( err ) {
                console.log( err ) ;
                this.emit( 'end' );
            }
        } ) )
    .pipe( rename( { suffix: '.min' } ) )
     .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( paths.css ) );
});

gulp.task( 'cleancss', function() {
  return gulp.src( paths.css + '/*.min.css', { read: false } ) // Much faster
    .pipe( ignore( 'theme.css' ) )
    .pipe( rimraf() );
});

gulp.task( 'styles', function( callback ) {
    gulpSequence( 'sass', 'minifycss' )( callback );
} );

// Run:
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task( 'browser-sync', function() {
    browserSync.init( cfg.browserSyncWatchFiles, cfg.browserSyncOptions );
} );

// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task( 'watch-bs', ['browser-sync', 'watch', 'scripts'], function() {
} );

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task( 'scripts', function() {
    var scripts = [

        // Start - All BS4 stuff
        paths.dev + '/js/bootstrap4/bootstrap.bundle.js',

        // End - All BS4 stuff

        paths.dev + '/js/skip-link-focus-fix.js',

        // Adding currently empty javascript file to add on for your own themes´ customizations
        // Please add any customizations to this .js file only!
        paths.dev + '/js/custom.js'
    ];
  gulp.src( scripts )
    .pipe( concat( 'theme.min.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( paths.js ) );

  gulp.src( scripts )
    .pipe( concat( 'theme.js' ) )
    .pipe( gulp.dest( paths.js ) );
});

// Deleting any file inside the /src folder
gulp.task( 'clean-source', function() {
  return del( ['src/**/*'] );
});

// Run:
// gulp copy-assets.
// Copy all needed dependency assets files from bower_component assets to themes /js, /scss and /fonts folder. Run this task after bower install or bower update
gulp.task( 'copy-assets', function() {
    // Copy all Font Awesome Fonts
    gulp.src( paths.node + 'font-awesome/fonts/**/*.{ttf,woff,woff2,eot,svg}' )
        .pipe( gulp.dest( './fonts' ) );
});

// Deleting the files distributed by the copy-assets task
gulp.task( 'clean-vendor-assets', function() {
  return del( [paths.dev + '/js/bootstrap4/**', paths.dev + '/sass/bootstrap4/**', './fonts/*wesome*.{ttf,woff,woff2,eot,svg}', paths.dev + '/sass/fontawesome/**', paths.dev + '/sass/underscores/**', paths.dev + '/js/skip-link-focus-fix.js', paths.js + '/**/skip-link-focus-fix.js', paths.js + '/**/popper.min.js', paths.js + '/**/popper.js', ( paths.vendor !== ''?( paths.js + paths.vendor + '/**' ):'' )] );
});

// Distribution tasks
// Remove trailing spaces of file lines
gulp.task('cleanLines', function(){
    return gulp.src(paths.distprod+'**/*.{php, css, html, js}')
    .pipe(plumber({ errorHandler: function(err) { notify.onError({ title: "Gulp error in " + err.plugin, message:  err.toString() })(err); gutil.beep(); }}))
    .pipe(trimlines({leading: false}))
    .pipe(whitespace({spacesToTabs: 4,removeTrailing: true}))
    .pipe(gulp.dest('./'))
    .pipe(notify({message: 'Whitespace removed from line ends',onLast: true}))
});

gulp.task('updateTextdomains', function() {
    gulp.src(paths.distprod+'**/*')
    .pipe(plumber({ errorHandler: function(err) { notify.onError({ title: "Gulp error in " + err.plugin, message:  err.toString() })(err); gutil.beep(); }}))
    .pipe(replace('{THEME-NAME}', titleCase(themeInfo.themeName)))
    .pipe(replace('{THEME-VERSION}', themeInfo.themeVersion))
    .pipe(replace('{TEXTDOMAIN}', themeInfo.textDomain))
    .pipe(replace('{THEME-LINK}', themeInfo.themeLink))
    .pipe(gulp.dest('./'))
    .pipe(notify({message: 'Textdomains, theme names and version placeholders populated',onLast:true}))
});

// Run
// gulp dist
// Copies the files to the /dist folder for distribution as simple theme
gulp.task( 'dist', ['clean-dist', 'cleanLines', 'updateTextdomains' ], function() {
  return gulp.src( ['**/*', '!' + paths.bower, '!' + paths.bower + '/**', '!' + paths.node, '!' + paths.node + '/**', '!' + paths.dev, '!' + paths.dev + '/**', '!' + paths.dist, '!' + paths.dist + '/**', '!' + paths.distprod, '!' + paths.distprod + '/**', '!' + paths.sass, '!' + paths.sass + '/**', '!readme.txt', '!readme.md', '!package.json', '!package-lock.json', '!gulpfile.js', '!gulpconfig.json', '!CHANGELOG.md', '!.travis.yml', '!jshintignore',  '!codesniffer.ruleset.xml',  '*'], { 'buffer': true } )
  .pipe( replace( '/js/jquery.slim.min.js', '/js' + paths.vendor + '/jquery.slim.min.js', { 'skipBinary': true } ) )
  .pipe( replace( '/js/popper.min.js', '/js' + paths.vendor + '/popper.min.js', { 'skipBinary': true } ) )
  .pipe( replace( '/js/skip-link-focus-fix.js', '/js' + paths.vendor + '/skip-link-focus-fix.js', { 'skipBinary': true } ) )
    .pipe( gulp.dest( paths.dist ) );
});

// Deleting any file inside the /dist folder
gulp.task( 'clean-dist', function() {
  return del( [paths.dist + '/**'] );
});

// Run
// gulp dist-product
// Copies the files to the /dist-prod folder for distribution as theme with all assets
gulp.task( 'dist-product', ['clean-dist-product', 'cleanLines', 'updateTextdomains' ], function() {
  return gulp.src( ['**/*', '!' + paths.bower, '!' + paths.bower + '/**', '!' + paths.node, '!' + paths.node + '/**', '!' + paths.dist, '!' + paths.dist +'/**', '!' + paths.distprod, '!' + paths.distprod + '/**', '*'] )
    .pipe( gulp.dest( paths.distprod ) );
} );

// Deleting any file inside the /dist-product folder
gulp.task( 'clean-dist-product', function() {
  return del( [paths.distprod + '/**'] );
} );

// Run:
// gulp
// Starts watcher (default task)
gulp.task('default', ['watch']);

var BLOG_NAME = "miladfarca/blog-posts";
var API_URL = "https://api.github.com/repos/" + BLOG_NAME + "/contents/";
var DOWNLOAD_URL = "https://raw.githubusercontent.com/" + BLOG_NAME + "/main/";
var IFRAME_HEIGHT = 0;

// initial setup steps
showdown.extension('highlight', function() {
  function htmlunencode(text) {
    return (
      text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
    );
  }
  return [{
    type: 'output',
    filter: function(text, converter, options) {
      // use new shodown's regexp engine to conditionally parse codeblocks
      var left = '<pre><code\\b[^>]*>',
        right = '</code></pre>',
        flags = 'g',
        replacement = function(wholeMatch, match, left, right) {
          // unescape match to prevent double escaping
          left = left.slice(0, 18) + 'hljs ' + left.slice(18);
          match = htmlunencode(match);
          return left + hljs.highlightAuto(match).value + right;
        };
      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
  }];
});

var create_navbar =
  function(tools_active) {
    var tools_class = tools_active ? "active" : "";
    var nav = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/blog/">miladfarca's blog</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                         <li class="nav-item"><a class="nav-link ` +
      tools_class + `" href="/blog/tools">Tools</a></li>
                </ul>
                <ul class="nav">
                    <!--<li class="nav-item"><a class="nav-link" href="#!">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="#!">Contact</a></li>-->
                    <li class="nav-item"><button type="button" class="btn btn-light"
                            onclick="window.open('https://github.com/miladfarca/blog')"><svg
                                xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-github" viewBox="0 0 16 16" style="top: -2px;position: relative;">
                                <path
                                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg> Github</button></li>
                </ul>
            </div>
        </div>
    </nav>
`;
    $("body").prepend(nav);
  }

var create_footer =
  function() {
    var footer = `
    <footer class="py-5 bg-dark">
        <div class="container">
            <p class="m-0 text-center text-white">Copyright &copy; miladfarca.github.io 2023</p>
        </div>
    </footer>
`;
    $("body").append(footer);
  }

var clean_title =
  function(title) {
    var list = title.split("-");
    list.shift();
    list = list.join(" ");
    return list.charAt(0).toUpperCase() + list.slice(1);
  }

var get_card_content =
  function(url, index, callback) {
    var holder = document.createElement("div");
    $.get(url, function(data) {
      // remove any html tags
      $(holder).html(data);
      var text = $(holder).text();
      text = text.replace(/\n|\r/g, " ");
      text = text.replaceAll(/#/g, "");
      text = text.replaceAll(/  /g, " ");
      if (text.charAt(0) == ' ') {
        text = text.substring(1);
      }
      if (callback) {
        callback(text, index);
      }
    })
  }

var get_post_content =
  function(title) {
    // add the "md" part
    title += ".md";
    var url = DOWNLOAD_URL + title;
    $.get(
      url,
      function(data) {
        // convert md to html
        var converter = new showdown.Converter({
            extensions: ['highlight']
          }),
          text = data,
          html = converter.makeHtml(text);
        // append breadcrumb, remove the first part and .md
        title = title.substring(2).replaceAll(".md", "");
        var breadcrumb = `<nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><a href="./">Home</a></li>
                                <li class="breadcrumb-item active" aria-current="page">` + title + `</li>
                            </ol>
                        </nav>`;
        $(".page-content").append(breadcrumb);
        $(".page-content").append(html);
      })
  }

var create_post_cards =
  function(list) {
    for (var i = 0; i < list.length; i++) {
      var title = list[i].name;
      // make sure it's an md file.
      if (title.indexOf(".md") != -1) {
        var url = DOWNLOAD_URL + title;
        // remove the "md" part
        title = title.replace(".md", "");
        card = `<div class="card mb-4">
                    <div class="card-body">
                        <h2 class="card-title one-line-ellipsis h4">` +
          clean_title(title) + `</h2>
                        <div class="spinner-grow" role="status">
                            <span class="sr-only"></span>
                        </div>
                        <p class="card-text one-line-ellipsis post-content-` +
          i + `"></p>
                        <a class="btn btn-primary" href="?post=` +
          encodeURI(title) + `">Read more →</a>
                    </div>
                </div>`;
        $(".page-content").append(card);
        // add the card body.
        get_card_content(url, i, function(text, index) {
          // remove spinner.
          $(".post-content-" + index).parent().find(".spinner-grow").remove();
          $(".post-content-" + index).html(text);
        })
      }
    }
  }

var create_tool_cards =
  function(list) {
    for (var i = 0; i < list.length; i++) {
      var card = `<div class="card mb-4">
                    <div class="card-body">
                        <h2 class="card-title one-line-ellipsis h4">` +
        list[i].name + `</h2>
                        <p class="card-text one-line-ellipsis">` +
        list[i].info + `</p>
                        <a class="btn btn-primary" href="` +
        list[i].url + `">View tool</a>
                    </div>
                </div>`;
      $(".page-content").append(card);
    }
  }

var get_post_list =
  function() {
    $.get(API_URL, function(data) {
      if (data) {
        // reverse the array, newest post comes first
        data = data.reverse();
        create_post_cards(data);
      }
    })
  }

var init_blog =
  function() {
    var q = window.location.search;
    if (q != "") {
      $(".page-content").html("");
      get_post_content(q);
    } else {
      $(".page-content").html("");
      get_post_list();
    }
  }

var init_tools = function(tools_list) {
  create_tool_cards(tools_list);
}
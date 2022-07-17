var appRoot = require('app-root-path');
const path = require('path')
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"))
class News extends FzPage {

    constructor(){
        super("connected/profile/index.html")

        //ADD CARD 
        this.loadList(this)
        
    }

    async loadList(instance){
        $.get('https://api.frazionz.net/news', function(response) {

            var loadNews = new Promise((resolve, reject) => {
                
                $('#news_list').empty();
    
                response.forEach((news, k, array) => {
                    
                    let clones = [];
                    if ("content" in document.createElement("template")) {
                        // On prépare une ligne pour le tableau
                        var template = document.querySelector("#news_list");
                        
                        var tbody = document.querySelector("#news_list");
                        var clone = document.importNode(template.content, true);
                        clone.querySelector('#news__thumbnail').style.background = "url('https://frazionz.net/storage/posts/"+news.image+"')";
                        clone.querySelector('#news__title').innerHTML = news.title
                        clone.querySelector('.news__body').innerHTML = news.content
                        //clone.querySelector('.news__action').querySelector('a').setAttribute('href', "https://frazionz.net/news/"+news.slug)
    
                        tbody.appendChild(clone);
                        clones.push(clone)
                    }
    
                    if (k === array.length -1) resolve(clones);
    
                })
            })
    
            loadNews.then(() => {
                $('.loader-26').remove()
            })
        })
        .fail(function (error) {
            this.notyf('error', 'Impossile de récupérer les actualités')
        });
    }
}

module.exports = News;
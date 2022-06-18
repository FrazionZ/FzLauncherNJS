const FzPage = require('../../js/FzPage.js')
const Messaging = require('../../js/modals/messaging.js')
const { ipcRenderer } = require('electron')
class Home extends FzPage {

    constructor(afterLogin){
        super("connected/home.html")
        if(afterLogin){
            $("#header").load("includes/header.html");
        }
    }

    loadHome(){
        $.get('https://api.frazionz.net/news', function(data) {
            var loadNews = new Promise((resolve, reject) => {

                console.log(data[0])
                data.forEach((element, k, array) => {
        
                    let clones = [];
                    if ("content" in document.createElement("template")) {
                        // On prépare une ligne pour le tableau
                        var template = document.querySelector("#newCardList");
        
                        // On clone la ligne et on l'insère dans le tableau

                        var tbody = document.querySelector("#newCardList");
                        var clone = document.importNode(template.content, true);
                        clone.querySelector(".card").setAttribute("target_news", k);
                        clone.querySelector(".card").style.backgroundImage = "url('https://frazionz.net/storage/posts/"+element.image+"')";
                        clone.querySelector('#title_label').textContent = element.title
                        clone.querySelector('#author_label').textContent = "Par "+element.author.name
                        clone.querySelector(".moreView").setAttribute("data-href", "https://frazionz.net/news/"+element.slug);
                        
                        if(k == 0){
                            clone.querySelector(".card").classList.add("active");
                            $(clone.querySelector(".moreView")).show();
                        }
                        tbody.appendChild(clone);
                        clones.push(clone)
                    }
        
                    if (k === array.length -1) resolve(clones);
                })
            })
        
            loadNews.then((clones) => {
                const scrollContainer = document.querySelector("#newCardList");
                scrollContainer.addEventListener("wheel", (evt) => {
                    evt.preventDefault();
                    scrollContainer.scrollLeft += evt.deltaY;
                });
                $('.card.news').on('click', function(e) {
                    $('.card.news').removeClass('active');
                    $('.card.news').find('.moreView').off();
                    $('.card.news').find('.moreView').hide();
                    $(this).addClass('active');
                    $(this).find('.moreView').show();
                    $(this).find('.moreView').on('click', function() {
                        ipcRenderer.send('openUrlExternal', $(this).attr('data-href'))
                    })
                })
            })
        })
        .fail(function() {
            this.notyf('error', 'Impossile de récupérer les articles')
        });

        $.get('https://api.frazionz.net/github/launcher', function(response) {
          var versions = response;
          versions.forEach((version) => {
            $('#versions').append('<h4 class="text-gray">'+version.tag_name+'</h4>'+
            '<h5>'+version.body+'</h5><br />')
          })
        })
        .fail(function (error) {
            this.notyf('error', 'Impossile de récupérer les articles')
        });
    }

}

module.exports = Home;
var appRoot = require('app-root-path');
const path = require('path');
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"));
const axios = require('axios').default;

class EditCapeModal extends FzPage {

    constructor(){
        super("connected/profile/index.html")
        var instance = this;

        
        this.capesUrlBrut = "";
        this.categories = "";

        this.skinUrl = "https://api.frazionz.net/skins/display?username="+userSession.username;
        this.capeUrl = "https://api.frazionz.net/capes/display?username="+userSession.username;
  
        this.capeSkinViewer = new skinview3d.SkinViewer({
            canvas: document.getElementById("skinCape"),
            width: 300,
            height: 400,
            skin: "asset://img/steve.png"
        });
      
        // Change viewer size
        this.capeSkinViewer.width = 240;
        this.capeSkinViewer.height = 352.94;
      
        // Load another skin
        if(FZUtils.UrlExists(this.skinUrl))
            this.capeSkinViewer.loadSkin(this.skinUrl, { model: ((userSession.isSlim) ? "slim" : "default") });
          
            this.capeSkinViewer.loadCape(this.capeUrl);
  
            this.capeSkinViewer.playerObject.rotation.y = 34.095;

        let controlInfos = skinview3d.createOrbitControls(this.capeSkinViewer);
        controlInfos.enableRotate = false;
        controlInfos.enableZoom = false;
        controlInfos.enablePan = false;

        var loadCategories = async() => {
            return new Promise(async(resolve, reject) => {
            await axios.get('https://api.frazionz.net/capes/list')
                .then((response) => {
                var datas = response.data;
                this.categories = datas.categories;
                this.capesUrlBrut = datas.urlCapesBrut;
                this.categories.forEach((categorie, index, array) => {
                    $('.capesShelf .capes').append(
                    '<div class="categorieList" data-categ-id="'+index+'" id="'+categorie.dirname.toLowerCase()+'">'+
                        '<h3>'+categorie.dirname+'</h3>'+
                        '<div id="listingTable"></div>'+
                        '<div class="flex gap-15 pt-15">'+
                        '<a class="btn_prev btn btn-primary">Précédent</a>'+
                        '<a class="btn_next btn btn-primary">Suivant</a>'+
                        '</div>'+
                        'page: <span id="page"></span>'+
                    '</div>').ready(function () {
                        loadPaginateCategorie(categorie)
                    });
                    
                })
                })
            })
        }
        
        var loadPaginateCategorie = async (categorie) => {
            var current_page = 1;
            var records_per_page = 14;

            var objJson = {name: categorie.dirname, files: categorie.files};

            console.log(objJson)

            function prevPage()
            {
                if (current_page > 1) {
                    current_page--;
                    changePage(current_page);
                }
            }

            function nextPage()
            {
                if (current_page < numPages()) {
                    current_page++;
                    changePage(current_page);
                }
            }

            $('.capesShelf .capes #'+categorie.dirname.toLowerCase()+' .btn_prev').click(function() {
                prevPage();
            });

            $('.capesShelf .capes #'+categorie.dirname.toLowerCase()+' .btn_next').click(function() {
                nextPage();
            });


                
            function changePage(page)
            {
                var listCapes = $('.capesShelf .capes #'+categorie.dirname.toLowerCase());
                var btn_next = listCapes.find('.btn_next');
                var btn_prev = listCapes.find(".btn_prev");
                var listing_table = listCapes.find("#listingTable");
                var page_span = listCapes.find("#page");
            
                // Validate page
                if (page < 1) page = 1;
                if (page > numPages()) page = numPages();

                listing_table.empty();

                for (var i = (page-1) * records_per_page; i < (page * records_per_page) && i < objJson.files.length; i++) {
                    var urlCape = Buffer.from("https://auth.frazionz.net/skins/cape.php?f="+objJson.name+"/"+objJson.files[i]).toString('base64');
                    var urlCapeBrut = Buffer.from("https://api.frazionz.net/capes/brut?f="+objJson.name+"/"+objJson.files[i]).toString('base64');
                    listing_table.append('<div class="entities" id="ey_'+i+'"><img data-url-cape-brut="'+urlCapeBrut+'" data-url-cape="'+urlCape+'" id="img_cape_'+i+'" src="#" alt="cape_'+objJson.name+'"></div>');
                    var imgEY = $(listing_table).find('.entities#ey_'+i).find('img');
                    imgEY.attr('src', Buffer.from(imgEY.attr('data-url-cape'), 'base64'))
                    

                    $(listing_table).find('.entities#ey_'+i).on('click', function(){
                        var urlCapeBrutF = Buffer.from($(this).find('img').attr('data-url-cape-brut'), 'base64').toString();
                        console.log('Load cape from '+urlCapeBrutF);
                        editCapeModal.capeSkinViewer.loadCape(urlCapeBrutF);
                    })
                }
                
                page_span.html(page + "/" + numPages());

                if (page == 1) {
                    btn_prev.hide()
                } else {
                    btn_prev.show()
                }

                if (page == numPages()) {
                btn_next.hide()
                } else {
                btn_next.show()
                }
            }

            function numPages()
            {
                return Math.ceil(objJson.files.length / records_per_page);
            }

            changePage(1);

        }
        
        setTimeout(async () => {
            await loadCategories();
        })
    }

}

module.exports = EditCapeModal;
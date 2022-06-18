
class FzModal {

    constructor(showAndLoad, file, idDom){
        this.path = require('path')
        this.file = file;
        this.idDom = idDom;
        this.dom = undefined;
        this.load(showAndLoad);
    }

    load(showAndLoad){
        let instance = this;
        if(!$("body").find("#modal").find(instance.idDom)[0]){
            $.get(instance.path.join(__dirname, instance.file), function(data){
                $('body').find('#modal').append(data);
                instance.dom = $("body").find("#modal").find(instance.idDom);
                if(showAndLoad){
                    instance.loaded()
                    instance.show()
                }
            });
        }else{
            instance.dom = $("body").find("#modal").find(instance.idDom);
            if(showAndLoad){ 
                instance.loaded()
                instance.show() 
            }
        }
    }

    loaded(){
    }

    show(){
        $("body").find("#modal").find(this.idDom).modal('show');
    }

    async hide(){    
        $("body").find("#modal").find(this.idDom).modal('hide');
        $("body").find("#modal").find(this.idDom).remove();
    }

}

module.exports = FzModal;
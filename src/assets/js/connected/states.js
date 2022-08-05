var appRoot = require('app-root-path');
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))

class States extends FzPage {

    
    constructor(){
        super("connected/state/index.html")
        $.get('https://api.frazionz.net/status', function(response) {

            response = JSON.parse(response)
            console.log(response)

            var loadStates = new Promise((resolve, reject) => {

                response.forEach((categorie, k, array) => {

                    let clones = [];
                    if ("content" in document.createElement("template")) {
                        // On prépare une ligne pour le tableau
                        var template = document.querySelector("#monitors");

                        // On clone la ligne et on l'insère dans le tableau

                        var tbody = document.querySelector("#monitors");
                        var clone = document.importNode(template.content, true);
                        clone.querySelector('#categorie_name').textContent = categorie.displayName

                        categorie.monitors.forEach((monitor) => {
                            if ("content" in document.createElement("template")) {
                                // On prépare une ligne pour le tableau
                                var templateChild = clone.querySelector("#monitor");

                                // On clone la ligne et on l'insère dans le tableau
                                var tbodyChild = clone.querySelector("#monitor");
                                var cloneChild = document.importNode(templateChild.content, true);
                                cloneChild.querySelector('#name').textContent = monitor.displayName
                                cloneChild.querySelector('.icon').classList.add((monitor.status == "up") ? "bxs-chevron-up" : "bxs-chevron-down")
                                cloneChild.querySelector('.icon').classList.add((monitor.status == "up") ? "text-green" : "text-red")
                                cloneChild.querySelector('#available').textContent = parseInt(monitor.sla.attributes.availability | 0)+"%"

                                tbodyChild.appendChild(cloneChild);
                            }
                        });

                        tbody.appendChild(clone);
                        clones.push(clone)
                    }

                    if (k === array.length -1) resolve(clones);

                })
            })

            loadStates.then(() => {
                $('.loader-26').remove()
            })
        })
        .fail(function (error) {
            this.notyf('error', 'Impossile de récupérer les articles')
        });
    }

}

module.exports = States;
var appRoot = require("app-root-path");
const path = require("path");
const FzPage = require(path.join(appRoot.path, "/src/assets/js/FzPage.js"));
const FZUtils = require(path.join(appRoot.path, "/src/assets/js/utils.js"));
const server_config = require(path.join(appRoot.path, "/server_config.json"));
const {
    shell,
    ipcRenderer
} = require("electron");

class Settings extends FzPage {
    constructor(server) {
        super(null);
        this.server_key = server;
        this.server = server_config[server];
        this.dirServer = `${this.dirFzLauncherServer}\\${this.server.name}`;
        this.buttonActionPlay = $(".btn-download-launch-game");
        this.keyStoreServerOptions = function(key) {
            return "server_" + this.server.name.toLowerCase() + "_" + key;
        };

        this.ramAllocateIndexProperties = this.store.has(
                this.keyStoreServerOptions("ramIndex")
            ) ?
            this.store.get(this.keyStoreServerOptions("ramIndex")) :
            undefined;
        this.listRamAllocate = FZUtils.listRamAllocate();
        var instance = this;

        /**/

        /*$('#inputRamSelector').change(function() {
                var indexRam = 0;
                $( "#inputRamSelector option:selected" ).each(function() {
                    indexRam = $( this ).attr('value');
                });
                instance.store.set(instance.keyStoreServerOptions('ramIndex'), parseInt(indexRam));
                instance.ramAllocateIndexProperties = indexRam;
                instance.notyf("success", "La ram alloué a bien été changé.")
            })*/
        if (this.ramAllocateIndexProperties == undefined)
            this.ramAllocateIndexProperties = 0;

        var gb = this.listRamAllocate.list[this.ramAllocateIndexProperties].gb;

        var setRangeSliderRam = function(value, max) {
            var percent = (value / max) * 100 - 5;
            $("#range_ram_allocate").attr("value", value);
            $(".range_ram_indicator").text(value + " Go");
            $("#range_ram_allocate").css(
                "background",
                "linear-gradient(to right, var(--color-1) 0%, var(--color-1) " +
                percent +
                "%, var(--fzbg-1) " +
                percent +
                "%, var(--fzbg-1) 100%)"
            );
        };

        $("#range_ram_allocate").attr("max", this.listRamAllocate.total_memory);
        document.getElementById("range_ram_allocate").setAttribute("value", gb);
        $(".range_ram_indicator").text(gb + " Go");
        setRangeSliderRam(gb, this.listRamAllocate.total_memory);

        document
            .getElementById("range_ram_allocate")
            .addEventListener("change", function() {
                //SAVE RAM
                var indexRam = document.getElementById("range_ram_allocate").value - 1;
                instance.store.set(
                    instance.keyStoreServerOptions("ramIndex"),
                    parseInt(indexRam)
                );
                instance.ramAllocateIndexProperties = indexRam;
                instance.notyf("success", "La ram allouée a bien été changé.");
            });
        $("#range_ram_allocate").on("input", function() {
            setRangeSliderRam(this.value, this.max);
        });


        $(".config__switch_branch .menu .item").each(function(index) {
            if (instance.store.get(play.keyStoreServerOptions("branch")) ==$(this).attr('data-value'))
                $(this).addClass("active selected");
        });
        

        var valueGits = [];
        this.server.github.forEach(function(git){
            valueGits.push({name: git.branch.charAt(0).toUpperCase() + git.branch.slice(1), value: git.branch, selected: ((git.branch === instance.store.get(play.keyStoreServerOptions("branch"))))})
        })
        $('.config__switch_branch.ui.dropdown').dropdown({ values: valueGits })

        var preValueSwitchBranch = $('.config__switch_branch input[name="gitBranch"]').val();
        $('.config__switch_branch').on('click', function() {
            preValueSwitchBranch = $(this).val();
        }).on("change", function(event) {
            var valueSwitchBranch = $(this).find('input[name="gitBranch"]').val();
            layoutClass.loadModal(
                "switchBranchServer", [{server_name: instance.server.name, branch: valueSwitchBranch }], true,
                //DENY
                async () => {
                    loadServerTab($('.menu .item[data-tab="config"]'), "config", true);
                },
                //APPROVE
                async () => {
                    layoutClass.closeModal("switchBranchServer")
                    FZUtils.checkedIfinecraftAlreadyLaunch().then(async (result) => {
                        if (result){
                            loadServerTab($('.menu .item[data-tab="config"]'), "config", true);
                            return instance.notyf("error", ZUtils.getLangKey('minecraft.alreadylaunch'));
                        }else {
                            layoutClass.loadModal( "messDialog", [{message: "Préparation de la version \""+valueSwitchBranch+"\" en cours.."}], false, () => {})
                            setTimeout(() => {
                                instance.store.set(
                                    play.keyStoreServerOptions("branch"),
                                    valueSwitchBranch
                                );
                                instance.notyf("success", "Vous basculez en version " +
                                    valueSwitchBranch.charAt(0).toUpperCase() +
                                    valueSwitchBranch.slice(1)
                                );
                                instance.buttonActionPlay.off();
                                play.loadBranch();
                                play.preInit().then((reposServer) => {
                                    layoutClass.closeModal("messDialog");
                                });
                            }, 1000)
                        }
                    });
                }
            );
        });

        $(".config__clear_cachesc_dir").on("click", function() {
            FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                if (result) return this.notyf("error", FZUtils.getLangKey('minecraft.alreadylaunch'));
                else {
                    $(".config__clear_cachesc_dir").addClass("disabled");
                    instance.fs.rm(
                        instance.path.join(instance.dirServer, "assets/frazionz/skins"), {
                            recursive: true,
                            force: true
                        },
                        (err) => {
                            $(".config__clear_cachesc_dir").removeClass("disabled");
                            if (err) return instance.notyf("error", err);
                            else
                                instance.notyf("success", "Le dossier a bien été supprimé !");
                        }
                    );
                }
            });
        });
        $(".config__repare_dir").on("click", function() {
            FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                if (result) return this.notyf("error", FZUtils.getLangKey('minecraft.alreadylaunch'));
                else {
                    instance.buttonActionPlay.find(".label").text("Réparer");
                    instance.buttonActionPlay.attr("disabled", "disabled");
                    $(".config__switch_branch").addClass("disabled");
                    $(".config__repare_dir").addClass("disabled");
                    $(".config__clear_dir").addClass("disabled");
                    play.prepareInstallOrUpdate();
                }
            });
        });
        $(".config__view_dir").on("click", function() {
            shell.openPath(instance.dirServer);
        });
        $(".config__clear_dir").on("click", function() {
            FZUtils.checkedIfinecraftAlreadyLaunch().then((result) => {
                if (result)
                    return instance.notyf("error", FZUtils.getLangKey('minecraft.alreadylaunch'));
                else instance.clearDirServer(instance, true);
            });
        });
        $(".config__server_checkbox").each((index, element) => {
            if (instance.store.has(instance.keyStoreServerOptions($(element).attr("data-id")))) {
                $(element).prop("checked", instance.store.get( instance.keyStoreServerOptions($(element).attr("data-id"))) ? true :false);
            } else {
                var defaultValue = JSON.parse(
                    $(element).attr("data-default").toLowerCase()
                );
                instance.store.set(
                    instance.keyStoreServerOptions($(element).attr("data-id")),
                    defaultValue
                );
                $(element).prop("checked", defaultValue);
            }
        });
        $(".config__server_checkbox").on("change", function() {
            instance.store.set(
                instance.keyStoreServerOptions($(this).attr("data-id")),
                $(this).is(":checked")
            );
        });
        if (
            instance.store.has(
                instance.keyStoreServerOptions("config__server_display_size")
            )
        ) {
            var size = instance.store
                .get(instance.keyStoreServerOptions("config__server_display_size"))
                .split(":");
            $("#config__display_width").val(size[0]);
            $("#config__display_height").val(size[1]);
        }
        $(".config__server_display_size").on("click", function() {
            var widthDisplay = $("#config__display_width");
            var heightDisplay = $("#config__display_height");
            if (
                parseInt(widthDisplay.val()) < parseInt(widthDisplay.attr("min")) ||
                parseInt(heightDisplay.val()) < parseInt(heightDisplay.attr("min"))
            )
                return instance.notyf(
                    "error",
                    "La taille de la fenêtre doit être au minimum à 800x600"
                );
            var sizeFinal = widthDisplay.val() + ":" + heightDisplay.val();
            instance.store.set(
                instance.keyStoreServerOptions("config__server_display_size"),
                sizeFinal
            );
            instance.notyf("success", "La taille de la fenêtre a bien été changée !");
        });
    }

    async clearDirServer(instance, announceCleared) {
        return new Promise((resolveGlobal, rejectGlobal) => {
            $(".config__clear_dir").addClass("disabled");
            var excludesFiles = [
                "resourcepacks",
                "saves",
                "shaderpacks",
                "options.txt",
                "optionsof.txt",
            ];
            instance.fs.readdir(instance.dirServer, function(err, files) {
                //handling error
                if (err) resolveGlobal(false);
                var rmOrUnlinkLoop = new Promise((resolve, reject) => {
                    files.forEach(function(fileOrDir, index, array) {
                        var hasDelete = true;
                        excludesFiles.forEach((excludesFile) => {
                            if (excludesFile == fileOrDir) hasDelete = false;
                        });
                        if (hasDelete) {
                            var statFile = instance.fs.lstatSync(
                                instance.path.join(instance.dirServer, fileOrDir)
                            );
                            if (statFile.isDirectory()) {
                                instance.fs.rm(
                                    instance.path.join(instance.dirServer, fileOrDir), {
                                        recursive: true,
                                        force: true
                                    },
                                    (err) => {
                                        if (index === array.length - 1) resolve();
                                    }
                                );
                            } else if (statFile.isFile()) {
                                instance.fs.unlink(
                                    instance.path.join(instance.dirServer, fileOrDir),
                                    (err) => {
                                        if (index === array.length - 1) resolve();
                                    }
                                );
                            }
                        } else if (index === array.length - 1) resolve();
                    });
                });
                rmOrUnlinkLoop.then(() => {
                    $(".config__clear_dir").removeClass("disabled");
                    if (err) resolveGlobal(false);
                    else {
                        instance.buttonActionPlay.find(".label").text("Installer");
                        instance.buttonActionPlay.removeAttr("disabled");
                        $(".config__switch_branch").addClass("disabled");
                        $(".config__clear_dir").addClass("disabled");
                        $(".config__repare_dir").addClass("disabled");
                        instance.buttonActionPlay.off();
                        instance.buttonActionPlay.on("click", () => {
                            instance.buttonActionPlay.attr("disabled", "disabled");
                            play.prepareInstallOrUpdate();
                        });
                        if (announceCleared)
                            instance.notyf("success", "Le dossier a bien été supprimé !");
                        resolveGlobal(true);
                    }
                });
            });
        });
    }
}

module.exports = Settings;
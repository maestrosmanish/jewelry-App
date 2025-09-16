/**************************** Google Shopping Feed PRODUCT OPTIONS **************************/
GSF_Options = Class.create();

GSF_Options.prototype = {

    initialize: function(){

        this.selected = {};
        this.prices = {};

        var self = this;
        var n = 1;
        $$('.product-custom-option').each(function (element) {
            window.setTimeout(self.autoUpdate(element), 300 * n++);
        });
    },

    autoUpdate: function(element) {
        var attributeId = element.id;
        this.registerEvents(attributeId);
        this.selectOptions(attributeId);
    },

    selectOptions: function(attributeId) {
        var Params = document.URL.toQueryParams();
        var select = $(attributeId);
        if (select !== null && typeof select != 'undefined' && typeof select.options != 'undefined') {
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value == Params[attributeId]) {
                    select.selectedIndex = i;
                    if ("createEvent" in document) {
                        var evt = document.createEvent("HTMLEvents");
                        evt.initEvent("change", false, true);
                        select.dispatchEvent(evt);
                    }
                    else {
                        select.fireEvent("onchange");
                    }
                }
            }
        }

        if(select.type == 'radio'){
            var radioText = 'radio';
            for(var i=0; i< Object.keys(Params).length; i++){
                if(Object.keys(Params)[i].indexOf(radioText) > -1){
                    $$('.product-custom-option').each(function(el){
                        if(el.value == Object.values(Params)[i]){
                            el.click();
                        }
                    });
                }
            }
        }
    },

    registerEvents: function (attributeId) {
        var self = this;

        // Select on Change
        var select = $(attributeId);
        if (typeof select != 'undefined' && select !== null) {
            Event.observe(select, 'change', function(event) {
                if (select.type == 'radio') {
                    option_id = select.value;
                } else {
                    option_id = select.options[select.selectedIndex].value;
                }
                self.update(attributeId, option_id);
            });
        }
    },

    update: function(attributeId, option_id) {
        var self = this;
        if (typeof opConfig !== 'undefined') {
            // do nothing here for now
        }
    }
};

Event.observe(window, 'load', function () {
    var gsf_options = new GSF_Options();
});
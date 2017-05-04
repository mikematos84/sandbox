(function($){

    var _data = null;
    var _select = {};
    
    $.get('data/fields.json').done(function(data){
        _data = data;
        build();
    });

    function build(){
        $(_data.fields).each(function(index, field){
            
            switch(field.type.toLowerCase()){
                case 'text':
                    inputText(field);
                break;

                case 'select':
                    inputSelect(field);
                break;
            }

        }).promise().done(function(evt){

            $('select').change(function(evt){

                var name = $(this).attr('name');
                var value = $(this).val();
                _select[name] = value;

                var fieldData = JSON.search(_data.fields, '//*[name="' + name + '"]');
                var optionData = JSON.search(_data, '//' + name);
                var $placeholder = $(this).find('option[value="'+value+'"]').index();
                $(this).toggleClass('placeholder', $placeholder == 0 ? true : false);

                if('onchange' in fieldData[0]){
                    $.each(fieldData[0].onchange, function(index, key){
                        $('select[name="' + key + '"]').val('').addClass('placeholder');
                    });
                }

                filterOptions();
            
            }).trigger('change');

        });
    }

    function objectKeys(obj){
        var temp = [];
        for(var key in obj){
            temp.push(key);
        }
        return temp;
    }

    function populateOptions(field, $select, optionData){
        if(optionData == undefined){
            return;
        }
        var list = [];
        
        $select.empty();
        var empty = $('<option />').attr({
            value: ''
        }).addClass('placeholder').text(field.placeholder);
        list.push(empty);

        $(optionData.options).each(function(index, option){
            var $option = $('<option />').attr({
                value: option.value
            }).text(option.text);

            list.push($option);
        });

        $select.append(list);
    }

    function filterOptions(){
        $('select').each(function(index, select){
            var $select = $(select);
            var name = $(select).attr('name');
            var value = $(select).val();
            var on_change_update = JSON.search(_data, '//' + name + '/on_change_update');
            var optionData = JSON.search(_data, '//' + name + '/options');
            //township/options[when[state="PA"]]

            if('when' in optionData[0]){
                var keys = objectKeys(optionData[0].when);
                var filter = [];
                $.each(keys, function(index, key){
                    filter.push(key + "='" + _select[key] + "'");
                });
                var options = JSON.search(_data, '//' + name + '/options[when['+filter.join(' or ')+']]');
                var field = JSON.search(_data.fields, '//*[name="' + name + '"]');
                
                $select.find('option:not(:eq(0))').hide();
                var exists = false;
                $(options).each(function(index, option){
                    $select.find('option[value="'+option.value+'"]').show();
                });                
            }
        })
        
    }

    function inputText(field){
        var $container = $('<div />');
        var $label = $('<label />').text(field.label).appendTo($container);
        var $input = $('<input />').attr({
            type: field.type,
            name: field.name,
            placeholder: field.placeholder
        }).appendTo($container);
        $container.appendTo('body');
    }

    function inputSelect(field){
        var $container = $('<div />');
        var $label = $('<label />').text(field.label).appendTo($container);
        var $select = $('<select />').attr({
            name: field.name
        }).appendTo($container);
        $container.appendTo('body');
        
        var optionData = JSON.search(_data, '//' + field.name);
        populateOptions(field, $select, optionData[0]);
    }
   

})(jQuery);
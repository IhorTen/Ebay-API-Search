var quantity = 15;
var max_length = 30;
var full_inf_length = 10;
var IdList = [];
var keywords = '';

showIdList();

//создаем Ebay API URL запрос, со всеми нужными параметрами и фильтрами
function get_url() {
    url = "https://svcs.ebay.com/services/search/FindingService/v1";
    url += "?OPERATION-NAME=findItemsByKeywords";
    url += "&SERVICE-VERSION=2.0.0";
    url += "&siteid=EBAY-US";
    url += "&SECURITY-APPNAME=-My1Api-PRD-68bb06b1d-2b1daea1";
    url += "&GLOBAL-ID=EBAY-US";
    url += "&RESPONSE-DATA-FORMAT=JSON";
    url += "&callback=_cb_findItemsByKeywords";
    url += "&sortOrder=StartTimeNewest";
    url += "&REST-PAYLOAD";
    url += "&keywords=" + keywords;
    url += "&itemFilter(0).name=HideDuplicateItems";
    url += "&itemFilter(0).value=true";
    url += "&itemFilter(1).name=ListingType";
    url += "&itemFilter(1).value(0)=AuctionWithBIN";
    url += "&itemFilter(1).value(1)=FixedPrice";
    url += "&itemFilter(2).name=LocatedIn";
    url += "&itemFilter(2).value(0)=US";
    url += "&paginationInput.entriesPerPage=" + quantity;

    return url;
}

function showIdList(root) {
    if (keywords && !$('.button_off_on').hasClass('btn-danger')) {
        real_url = get_url();

        if (document.getElementById('showIdList')) {
            document.getElementById('showIdList').remove();
        }

        main_url = document.createElement('script');
        main_url.src = real_url;
        main_url.id = 'showIdList';
        document.body.appendChild(main_url);
    }

    setTimeout(function () {
        showIdList(root);
    }, 1000);
}


function _cb_findItemsByKeywords(root) {
    var items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    var updated_elements = [];
    var time_Now = ((new Date().getTime()) - (new Date().getTimezoneOffset()));
    var max_time = 600000;
    var minute = 60000;
    var second = 1000;

    if (!IdList.length) {
        //если масив IdList пустой, то в него добавляются только ID элементов
        IdList = GetNewIdList(items, 'id_list');
    } else {
        //если масив IdList заполнен ID-ми, то в новый масив updated_elements добавляются элементы со всей информацией
        updated_elements = GetNewIdList(items, '');

        for (var i = 0; i < updated_elements.length; i++) {
            var new_Id = '';

            for (var e = 0; e < IdList.length; e++) {
                if (updated_elements[i].itemId[0] == IdList[e].itemId[0]) {
                    //если ID повторяются в обоих массивах, условие break
                    new_Id = 'found';
                    break;
                }
            }

            if (!new_Id) {
                //находим новое ID и дальше проверка на макс длину массива
                if (IdList.length >= max_length)
                    IdList.splice(max_length - 1, 1);

                //вычисляем разницу во времени от момента когда продукт выставили и до момента когда
                // поиск его 'выловил', и дальше сортируем по этой временной разнице и добавляем ее значение в
                // полную информацию об элементе
                var time_diff = time_Now - Date.parse(updated_elements[i].listingInfo[0].startTime[0]);

                if (time_diff < max_time) {
                    var minutes,
                        seconds;
                    minutes = Math.floor(time_diff / minute) + ' min';
                    seconds = Math.floor((time_diff % minute) / second) + ' sec';

                    updated_elements[i].timeDif = [minutes + ' : ' + seconds];
                } else {
                    updated_elements[i].timeDif = ['< 10 min'];
                }

                var price;
                //если аукцион то цена элемента будет равна цене Buy It Now, если нет - то обычная
                if (updated_elements[i].listingInfo[0].listingType[0] === 'AuctionWithBIN')
                    price = updated_elements[i].listingInfo[0].buyItNowPrice[0].__value__;
                else
                    price = updated_elements[i].sellingStatus[0].currentPrice[0].__value__;

                // создаем сам элемент в html
                newElemList = '';
                newElemList += '<li class="item product col-md-3 ">';
                newElemList += '<div class="product_container">';
                newElemList += '<a target="_blank" rel="noopener noreferrer" href="' + updated_elements[i].viewItemURL[0] + '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">';
                newElemList += '<img  src="' + updated_elements[i].galleryURL[0] + '" ></a>';
                newElemList += '<div class="es-product-title-wrap">';
                newElemList += '<a target="_blank" rel="noopener noreferrer" href="' + updated_elements[i].viewItemURL[0] + '">';
                newElemList += '<h2 class="woocommerce-loop-product__title">' + updated_elements[i].title[0] + '</h2></a>';
                newElemList += '<span class="price">$' + price + '</span></div>';
                newElemList += '<div class="es-product-buttons-wrap">';
                newElemList += '<a  href="#" class="add_to_cart_button ">ID: ' + updated_elements[i].itemId[0] + '</a>';
                newElemList += '<a href="#" class="add_to_wishlist">' + updated_elements[i].timeDif[0] + '</a></div>';
                newElemList += '</div>';
                newElemList += '</li>';

                // сортируем по категории 9355 (Cell Phones & Smartphones)(отображаем элементы только из этой категории)
                if (updated_elements[i].primaryCategory[0].categoryId[0] === '9355') {
                    IdList.unshift(updated_elements[i]);
                    //если разница во времени больше 10 мин, элемент в списке New Elements не отображаеться, выводится
                    // только его ID в списке Saved Elements
                    if (time_diff < max_time)
                        $('.updated_el_list').prepend(newElemList);


                    // все элементы до full_inf_length имеют полную информацию, остальные только ID
                    if (IdList.length > full_inf_length)
                        IdList[full_inf_length] = {'itemId': [IdList[full_inf_length].itemId]};
                }
            }
        }
        console.log(IdList);

        //сохраненные ID всех элементов ( в html это список Saved Elements)
        var savedHTMLid = [];
        for (var i = 0; i < IdList.length; i++) {
            savedHTMLid.push('<span class="Id_List_new">' + IdList[i].itemId[0] + '</span>');
        }
        $(".Id_List").html(savedHTMLid.join(""));
    }
}

//функция создает самый первый ID массив (только ID), если он уже есть то пушит всю информацию об новом элементе
function GetNewIdList(items, only_id) {
    NewidList = [];

    for (var i = 0; i < items.length; i++) {
        Idarray = {};

        if (only_id === 'id_list')
            Idarray.itemId = items[i].itemId;
        else
            Idarray = items[i];

        NewidList.push(Idarray);
    }
    return NewidList;
}

function get_keywords() {
    keywords = $('.search_input').val();
    error = '';

    if (!keywords) {
        error = 'Keywords are empty!';
        console.log(error);
        $('.search_input').attr('placeholder', error);
    } else
        return keywords;
}
// код который меняет классы, id, цвета и названия кнопок
$('.button_status').on('click', function (elem) {
    butt_status = $(elem.target);
    butt_status_id = butt_status.attr('id');

    switch (butt_status_id) {
        case 'butt_start':
            butt_status.attr('id', 'butt_searching');
            butt_status.html('Searching...');
            keywords = get_keywords();
            break;
        case 'butt_start_new':
            keywords = get_keywords();
            butt_status.removeClass('btn-info');
            butt_status.addClass('btn-primary');
            butt_status.attr('id', 'butt_searching');
            butt_status.html('Searching...');
            break;
    }
});

function change_button_launch(remove, add, attr, html) {
    button_off_on_el = $('.button_off_on');

    button_off_on_el.removeClass(remove);
    button_off_on_el.addClass(add);
    button_off_on_el.attr('id', attr);
    button_off_on_el.html(html);
}


$('#butt_off_on').on('click', function () {
    button_off_on_id = $('.button_off_on').attr('id');

    switch (button_off_on_id) {
        case 'butt_off_on':
            change_button_launch('btn-success', 'btn-danger', 'butt_stopped', 'Press to launch');
            $('.button_status').addClass('disabled');
            break;
        case 'butt_stopped':
            change_button_launch('btn-danger', 'btn-success', 'butt_launched', 'Press to stop');
            $('.button_status').removeClass('disabled');
            break;
        case 'butt_launched':
            change_button_launch('btn-success', 'btn-danger', 'butt_stopped', 'Press to launch');
            $('.button_status').addClass('disabled');
            break;
    }
});

$('#butt_start').on('click', function () {
    $('.button_off_on').removeClass('disabled');
});

$('.search_input').on('keypress', function () {
    butt_stat = $('.button_status');

    if (butt_stat.attr('id') != 'butt_start') {
        butt_stat.attr('id', 'butt_start_new');
        butt_stat.removeClass('btn-primary');
        butt_stat.addClass('btn-info');
        butt_stat.html('Start New Search');
        //добавляет кнопку Back которая при нажатии возвращает предыдущее значение keywords, если input был изменен
        $('.butt_back_sp').html('<button id="butt_back" class="btn btn-dark butt_back ">Back</button>');
        $('.butt_back').on('click', function () {
            butt_stat_new = $('#butt_start_new');

            $('.butt_back').addClass('disabled');
            butt_stat_new.removeClass('btn-info');
            butt_stat_new.addClass('btn-primary');
            butt_stat_new.attr('id', 'butt_searching');
            butt_stat_new.html('Searching...');

            $('.search_input').val(keywords);
        });
        $('#butt_start_new').on('click', function () {
            $('#butt_back').remove();
        });
    }
});

// код которые позволяет вводить в input только буквы англ-го алфавита,а также цифры и символы .,+*
// $('.search_input').on('keypress', function (event) {
//     var regex = new RegExp("^[a-z.,+*A-Z0-9 ]+$");
//     var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
//     if (regex.test(str)) {
//         return true;
//     }
//
//     event.preventDefault();
//     return false
// });
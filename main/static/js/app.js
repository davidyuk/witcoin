$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip({ 'delay': 200 });

    $('.comments form button[type="submit"]').tooltip({
        'delay': 1000,
        'placement': 'bottom',
        'title': 'Enter — отправка сообщения Shift+Enter — перенос строки'
    });
    $('.comments .link-comment').click(function(event){
        var $comments = $(this).parents('.comments').first();
        var $form = $comments.find('form').first();
        $form.find('#id_comment').val('');
        $form.find('#id_parent').val('');
        $form.appendTo($comments);
        $(this).hide();
    });
    $('.comments .link-reply').click(function(event) {
        var $this = $(this);
        var $form = $this.parents('.comments').first().find('form').first();
        $form.find('#id_parent').val($this.data('comment-id'));
        $form.insertAfter($this.closest('div'));
        $('.comments .link-comment').show();
    });
    $('.comments .link-comment, .comments .link-reply').click(function(event) {
        $('.comments form').hide();
        var $form = $(this).parents('.comments').first().find('form').first();
        $form.show().find('input[type!="hidden"], textarea').first().focus();
        event.stopPropagation();
        event.preventDefault();
        $('body').click(function FormHide(event) {
            if ($(event.target).closest('.comments form').length === 0) {
                $('.comments form').hide();
                $('.comments .link-comment').show();
                $('body').unbind('click', FormHide)
            }
        });
    });
    $('.comments textarea').keydown(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            $(this).parents('form').first().find(':submit').click();
            event.preventDefault();
        }
    });
    if (localStorage) {
        var scrollTop = localStorage["scrollTop"];
        if (scrollTop) {
            $(window).scrollTop(scrollTop);
            localStorage.removeItem("scrollTop");
        }
        $('.comments form').submit(function () {
            localStorage["scrollTop"] = $(window).scrollTop();
        });
    }
});

Witcoin.extendInit(function() {
    $('[data-vote]').each(function() {
        var buttons = $('[data-up], [data-down], [data-clear]', this);
        var action = $(this).data('action');
        var id = $(this).data('id');
        if (!action || !id) return;
        var score = $('[data-score]', this);
        function event(directon) {
            return function() {
                buttons.removeClass('disabled').removeAttr('disabled');
                $(this).addClass('disabled').attr('disabled', 'disabled');
                Witcoin.vote(action, id, directon).then(function(err, data) {
                    if (!err) {
                        score.text(data.score.score);
                    } else {
                        console.log(err, data);
                    }
                });
                return false;
            }
        }
        $('[data-up]', this).on('click', event('up'));
        $('[data-down]', this).on('click', event('down'));
        $('[data-clear]', this).on('click', event('clear'));
    });
});

Witcoin.init();

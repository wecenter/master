var aw_loading_timer;
var aw_loading_bg_count = 12;

$.loading = function (s) {
	if ($('#aw-loading').length == 0)
    {
        $('#aw-ajax-box').append(AW_TEMPLATE.loadingBox);
    }
    
	if (s == 'show')
	{
		if ($('#aw-loading').css('display') == 'block')
	    {
		    return false;
	    }
		
		$('#aw-loading').fadeIn();
	
		aw_loading_timer = setInterval(function () {
			aw_loading_bg_count = aw_loading_bg_count - 1;
			
			$('#aw-loading-box').css('background-position', '0px ' + aw_loading_bg_count * 40 + 'px');
			
			if (aw_loading_bg_count == 1)
			{
				aw_loading_bg_count = 12;
			}
		}, 100);
	}
	else
	{
		$('#aw-loading').fadeOut();
	
		clearInterval(aw_loading_timer);
	}
};

(function ($)
{
    $.fn.insertAtCaret = function (textFeildValue)
    {
        var textObj = $(this).get(0);
        if (document.all && textObj.createTextRange && textObj.caretPos)
        {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                textFeildValue + '' : textFeildValue;
        }
        else if (textObj.setSelectionRange)
        {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            textObj.blur();
        }
        else
        {
            textObj.value += textFeildValue;
        }
    } 

    $.extend(
    {
        //编辑器插入图片
        addTextpicTure : function ()
        {
        	if($('#addTxtForms :input[name="imgsUrl"]').val() == '')
        	{
        		return false;
        	}
            var textFeildValue = '\n![' + ($('#addTxtForms :input[name="imgsAlt"]').val()) + '](' + $('#addTxtForms :input[name="imgsUrl"]').val() + ')';
            if ($('.aw-mod-replay-box .advanced_editor')[0])
	        {
	        	$('.aw-mod-replay-box .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('.aw-mod-publish .advanced_editor')[0])
	        {
	        	$('.aw-mod-publish .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('body').hasClass('aw-editing-free'))
	        {
	        	$('.aw-free-editor .advanced_editor').insertAtCaret(textFeildValue);
	        }
        },

        //编辑器插入视频
	    addVideo: function ()
	    {
	        if ($('#addTxtForms :input[name="videoUrl"]').val().indexOf('.swf') != -1)
	        {
	            alert(_t('请输入视频网站页面地址, 不是播放器地址'));

	            return false;
	        }
	        var textFeildValue = '\n!![' + ($('#addTxtForms :input[name="videoTitle"]').val()) + '](' + $('#addTxtForms :input[name="videoUrl"]').val() + ')';
	        if ($('.aw-mod-replay-box .advanced_editor')[0])
	        {
	        	$('.aw-mod-replay-box .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('.aw-mod-publish .advanced_editor')[0])
	        {
	        	$('.aw-mod-publish .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('body').hasClass('aw-editing-free'))
	        {
	        	$('.aw-free-editor .advanced_editor').insertAtCaret(textFeildValue);
	        }
	    },

        //编辑器插入链接
        addLink : function()
        {
        	if ($('#addTxtForms :input[name="linkUrl"]').val() == '')
        	{
        		return false;
        	}
			var textFeildValue = '[' + ($('#addTxtForms :input[name="linkText"]').val()) + '](' + $('#addTxtForms :input[name="linkUrl"]').val() + ')';
			if ($('.aw-mod-replay-box .advanced_editor')[0])
	        {
	        	$('.aw-mod-replay-box .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('.aw-mod-publish .advanced_editor')[0])
	        {
	        	$('.aw-mod-publish .advanced_editor').insertAtCaret(textFeildValue);
	        }
	        if ($('body').hasClass('aw-editing-free'))
	        {
	        	$('.aw-free-editor .advanced_editor').insertAtCaret(textFeildValue);
	        }
        },

        // 设置编辑器预览状态
        setEditorPreview: function ()
        {
            if ($.cookie('data_editor_preview') != 'false')
            {
                $('.markItUpButton12 a').addClass('cur');
            }
            else
            {
				if ($('.markItUpPreviewFrame').css('display') == 'none')
				{
					$('.markItUpPreviewFrame').fadeIn();
				}
                else
				{
					$('.markItUpPreviewFrame').fadeOut();	
				}
            }
        },

        // 向编辑器中插入文本
        insertIntoCodemirror: function (fn)
        {
            var flag = false;
            var pos = {};
            var cursor = 0;
            var textarea = $('.advanced_editor');
            if (advanced_editor != null)
            {

                pos = advanced_editor.getCursor('start');

                advanced_editor.toTextArea();

                for (var i = 0, iLen = pos.line; i < iLen; i++)
                {
                    cursor += advanced_editor.lineInfo(i).text.length + 1;
                }

                cursor += pos.ch;

                if (textarea.createTextRange)
                {
                    // quick fix to make it work on Opera 9.5
                    /*if ($.browser.opera && $.browser.version >= 9.5 && advanced_editor.getSelection().length == 0)
                    {
                        return false;
                    }*/
					
                    range = textarea.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', cursor);
                    range.moveEnd('character', advanced_editor.getSelection().length);
                    range.select();
                }
                else if (textarea.setSelectionRange)
                {
                    textarea.setSelectionRange(cursor, cursor + advanced_editor.getSelection().length);
                }
                textarea.focus();

                advanced_editor = null;
                flag = true;
            }

            fn(arguments[1]);

            if (flag)
            {
                advanced_editor = CodeMirror.fromTextArea(textarea,
                {
                    mode: 'markdown',
                    lineNumbers: true,
                    theme: "default",
                    extraKeys:
                    {
                        "Enter": "newlineAndIndentContinueMarkdownList"
                    }
                });

                if (typeof arguments[1] != 'undefined' && (arguments[1].offset || arguments[1].addline))
                {
                    pos.line += (arguments[1].addline ? arguments[1].addline : 0);
                    pos.ch += (arguments[1].offset ? arguments[1].offset : 0);
                }

                advanced_editor.setCursor(pos);
            }
        }
    });
})(jQuery)

jQuery.fn.extend({
    highText: function (searchWords, htmlTag, tagClass)
    {
        return this.each(function ()
        {
            $(this).html(function high(replaced, search, htmlTag, tagClass)
            {
                var pattarn = search.replace(/\b(\w+)\b/g, "($1)").replace(/\s+/g, "|");

                return replaced.replace(new RegExp(pattarn, "ig"), function (keyword)
                {
                    return $("<" + htmlTag + " class=" + tagClass + ">" + keyword + "</" + htmlTag + ">").outerHTML();
                });
            }($(this).text(), searchWords, htmlTag, tagClass));
        });
    },
    outerHTML: function (s)
    {
        return (s) ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
    }
});


$.alert = function (text)
{
    if ($('.alert-box').length)
    {
        $('.alert-box').remove();
    }

    $('#aw-ajax-box').append(Hogan.compile(AW_TEMPLATE.alertBox).render(
    {
        message: text
    }));

    $(".alert-box .modal-dialog").css({
            left: $(window).width() / 2 - $(".alert-box .modal-dialog").width() / 2
        });
    $(".alert-box").modal('show');
};

/*
 **	公共弹窗
 *	alert       : 普通问题提示
 *	publish     : 发起
 *	shareOut    : 站外分享
 *	redirect    : 问题重定向
 *	imageBox    : 插入图片
 *	videoBox    : 插入视频
 *  linkbox     : 插入链接
 *	commentEdit : 评论编辑
 *  favorite    : 评论添加收藏
 *	inbox       : 新私信
 *  report      : 举报问题
 */
$.dialog = function (type_id, data)
{
    switch (type_id)
    {
	    case 'alert':
	        var template = Hogan.compile(AW_TEMPLATE.alertBox).render(
	        {
	            'message': data
	        });
	        break;
	
	    case 'publish':
	        var template = Hogan.compile(AW_TEMPLATE.publishBox).render(
	        {
	            'category_id': data.category_id,
	            'ask_user_id': data.ask_user_id
	        });
	        break;
	
	    case 'shareOut':
	        var template = Hogan.compile(AW_TEMPLATE.shareBox).render(
	        {
	            'items': AW_TEMPLATE.shareList
	        });
	        break;
	
	    case 'redirect':
	        var template = Hogan.compile(AW_TEMPLATE.questionRedirect).render(
	        {
	            'data_id': data
	        });
	        break;
	
	    case 'imageBox':
	        var template = Hogan.compile(AW_TEMPLATE.imagevideoBox).render(
	        {
	            'title': _t('插入图片'),
	            'url': 'imgsUrl',
	            'tips': 'imgsAlt',
	            'add_func': 'addTextpicTure',
	            'upload' : ''
	        });
	        break;
	
	    case 'videoBox':
	        var template = Hogan.compile(AW_TEMPLATE.imagevideoBox).render(
	        {
	            'title': _t('插入视频'),
	            'url': 'videoUrl',
	            'tips': 'videoTitle',
	            'type_tips' : _t('我们目前支持: 优酷、酷六、土豆、56、新浪播客、乐视、Youtube 与 SWF 文件'),
	            'add_func': 'addVideo',
	            'upload' : 'hide'
	        });
	        break;

	    case 'linkbox':
	    	var template = Hogan.compile(AW_TEMPLATE.linkBox).render(
	        {
	            'title': '插入链接',
	            'text' : 'linkText',
	            'url'  : 'linkUrl',
	            'add_func' : 'addLink'
	        });
	        break;
	
	    case 'commentEdit':
	        var template = Hogan.compile(AW_TEMPLATE.editCommentBox).render(
	        {
	            'answer_id': data.answer_id,
	            'attach_access_key': data.attach_access_key
	        });
	        break;
	
	    case 'favorite':
	        var template = Hogan.compile(AW_TEMPLATE.favoriteBox).render(
	        {
	            'answer_id': data
	        });
	        break;
	
	    case 'inbox':
	        var template = Hogan.compile(AW_TEMPLATE.inbox).render(
	        {
	            'recipient': data
	        });
	        break;
	
	    case 'report':
	        var template = Hogan.compile(AW_TEMPLATE.reportBox).render(
	        {
	            'item_type': data.item_type,
	            'item_id': data.item_id
	        });
	        break;
	        
	    case 'topicEditHistory':
	        var template = AW_TEMPLATE.ajaxData.replace('{{title}}', _t('编辑记录')).replace('{{data}}', data);
			break;
			
		case 'ajaxData':
			var template = AW_TEMPLATE.ajaxData.replace('{{title}}', data.title).replace('{{data}}', '<div id="aw_dialog_ajax_data"></div>');
			break;
    }

    if (template)
    {
        if ($('.alert-box').length)
        {
            $('.alert-box').remove();
        }

        $('#aw-ajax-box').html(template);


        $(".alert-box .modal-dialog").css({
            left: $(window).width() / 2 - $(".alert-box .modal-dialog").width() / 2
        });
        $(".alert-box").modal('show');

        switch (type_id)
        {
        	case 'redirect' : 
        		bind_dropdown_list($('.aw-question-redirect-box #question-input'), 'redirect');
        	case 'inbox' :
        		bind_dropdown_list($('.aw-inbox #invite-input'), 'inbox');
	        case 'publish':
	        	bind_dropdown_list($('.aw-publish-box #quick_publish_question_content'), 'publish');
	        	bind_dropdown_list($('.aw-publish-box #aw_edit_topic_title'), 'topic');
	        	if (parseInt(data.category_enable) == 1)
	        	{
		        	$.get(G_BASE_URL + '/publish/ajax/fetch_question_category/', function (result)
		            {
		                add_dropdown_list('.aw-publish-title-dropdown', eval(result), data.category_id);
		
		                $('.aw-publish-title-dropdown li a').click(function ()
		                {
		                    $('#quick_publish_category_id').val($(this).attr('data-value'));
		                });
		            });
		            
		            $('#quick_publish_topic_chooser').hide();
	        	}
	        	else
	        	{
		        	$('#quick_publish_category_chooser').hide();
	        	}
	
	            if ($('#aw-search-query').val() && $('#aw-search-query').val() != $('#aw-search-query').attr('placeholder'))
	            {
		            $('#quick_publish_question_content').val($('#aw-search-query').val());
	            }
	
	            init_topic_edit_box('#quick_publish .aw-edit-topic');
	            
	            $('#quick_publish .aw-edit-topic').click();
	
	            if (data.topic_title)
	            {
	                $('#quick_publish .aw-edit-topic').parents('.aw-topic-editor').prepend('<a href="javascript:;" class="aw-topic-name"><span>' + data.topic_title + '</span><input type="hidden" value="' + data.topic_title + '" name="topics[]" /></a>')
	            }
	            
	            if (G_QUICK_PUBLISH_HUMAN_VALID)
	            {
		            $('#quick_publish_captcha').show();
		            $('#captcha').click();
	            }
	            break;
	
	        case 'shareIn':
	        case 'shareOut':
	        	bind_dropdown_list($('.aw-share-box #invite-input'), 'inbox');
	
				switch (data.item_type)
				{
					case 'question':
					case 'answer':
					case 'article':
						var request_uri = G_BASE_URL + '/question/ajax/fetch_share_data/type-' + data.item_type + '__item_id-' + data.item_id;
					break;
				}
				
	            $.get(request_uri, function (result)
	            {
	            	$('#share_out_content').val(result.rsm.share_txt.message);
	
	                $('#bdshare').attr('data', '{text:\'' + result.rsm.share_txt.message.replace(' ' + result.rsm.share_txt.url, '') + '\', url:\'' + result.rsm.share_txt.url + '\', \'bdPic\': \'\'}');
	            }, 'json');
	            
	            break;
	
	        case 'favorite':
	            $.get(G_BASE_URL + '/favorite/ajax/get_favorite_tags/', function (result)
	            {
	                if (result.length > 0)
	                {
	                    $('#add_favorite_my_tags').show();
	                }
	
	                $.each(result, function (i, a)
	                {
	                    $('#add_favorite_my_tags').append('<a href="javascript:;" onclick="$(\'#add_favorite_tags\').val($(\'#add_favorite_tags\').val() + \'' + a['title'] + ',\');" class="aw-topic-name"><span>' + a['title'] + '</span></a> ');
	                });
	            }, 'json');
	            break;
	
	        case 'report':
	            $('.aw-report-box select option').click(function ()
	            {
	                $('.aw-report-box textarea').text($(this).attr('value'));
	            });
	            break;
	
	        case 'commentEdit':
	            $.get(G_BASE_URL + '/question/ajax/fetch_answer_data/' + data.answer_id, function (result)
	            {
	                $('#editor_reply').html(result.answer_content.replace('&amp;', '&'));
	            }, 'json');
				
	            init_fileuploader('file_uploader_answer_edit', G_BASE_URL + '/publish/ajax/attach_upload/id-answer__attach_access_key-' + ATTACH_ACCESS_KEY);
	            
	            if ($("#file_uploader_answer_edit ._ajax_upload-list").length) {
		            $.post(G_BASE_URL + '/publish/ajax/answer_attach_edit_list/', 'answer_id=' + data.answer_id, function (data) {
		                if (data['err']) {
		                    return false;
		                } else {
		                    $.each(data['rsm']['attachs'], function (i, v) {
		                        _ajax_uploader_append_file('#file_uploader_answer_edit ._ajax_upload-list', v);
		                    });
		                }
		            }, 'json');
		        }
	            break;
	            
	       case 'ajaxData':
		       $.get(data.url, function (result) {
					$('#aw_dialog_ajax_data').html(result);
				});
	       break;
        }
    }
}
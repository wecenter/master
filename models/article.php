<?php
/*
+--------------------------------------------------------------------------
|   WeCenter [#RELEASE_VERSION#]
|   ========================================
|   by WeCenter Software
|   © 2011 - 2013 WeCenter. All Rights Reserved
|   http://www.wecenter.com
|   ========================================
|   Support: WeCenter@qq.com
|   
+---------------------------------------------------------------------------
*/


if (!defined('IN_ANWSION'))
{
	die;
}

class article_class extends AWS_MODEL
{
	public function get_article_info_by_id($article_id)
	{
		return $this->fetch_row('article', 'id = ' . intval($article_id));
	}
	
	public function get_article_info_by_ids($article_ids)
	{
		if (!is_array($article_ids) OR sizeof($article_ids) == 0)
		{
			return false;
		}
		
		array_walk_recursive($article_ids, 'intval_string');
		
	    if ($articles_list = $this->fetch_all('article', "id IN(" . implode(',', $article_ids) . ")"))
	    {
		    foreach ($articles_list AS $key => $val)
		    {
		    	$result[$val['id']] = $val;
		    }
	    }
	    
	    return $result;
	}
	
	public function get_comment_by_id($comment_id)
	{
		if ($comment = $this->fetch_row('article_comments', 'id = ' . intval($comment_id)))
		{
			$comment_user_infos = $this->model('account')->get_user_info_by_uids(array(
				$comment['uid'],
				$comment['at_uid']
			));
			
			$comment['user_info'] = $comment_user_infos[$comment['uid']];
			$comment['at_user_info'] = $comment_user_infos[$comment['at_uid']];
		}
		
		return $comment;
	}
	
	public function get_comments($article_id, $page, $per_page)
	{
		if ($comments = $this->fetch_page('article_comments', 'article_id = ' . intval($article_id), 'add_time ASC', $page, $per_page))
		{
			foreach ($comments AS $key => $val)
			{
				$comment_uids[$val['uid']] = $val['uid'];
				
				if ($val['at_uid'])
				{
					$comment_uids[$val['at_uid']] = $val['at_uid'];
				}
			}
			
			if ($comment_uids)
			{
				$comment_user_infos = $this->model('account')->get_user_info_by_uids($comment_uids);
			}
			
			foreach ($comments AS $key => $val)
			{
				$comments[$key]['user_info'] = $comment_user_infos[$val['uid']];
				$comments[$key]['at_user_info'] = $comment_user_infos[$val['at_uid']];
			}
		}
		
		return $comments;
	}
	
	public function save_comment($article_id, $message, $uid, $at_uid = null)
	{
		if (!$article_info = $this->get_article_info_by_id($article_id))
		{
			return false;
		}
		
		$comment_id = $this->insert('article_comments', array(
			'uid' => intval($uid),
			'article_id' => intval($article_id),
			'message' => htmlspecialchars($message),
			'add_time' => time(),
			'at_uid' => intval($at_uid)
		));
		
		$this->update('article', array(
			'comments' => $this->count('article_comments', 'article_id = ' . intval($article_id))
		), 'id = ' . intval($article_id));
		
		if ($at_uid AND $at_uid != $uid)
		{
			$this->model('notify')->send($uid, $at_uid, notify_class::TYPE_ARTICLE_COMMENT_AT_ME, notify_class::CATEGORY_ARTICLE, $article_info['id'], array(
				'from_uid' => $uid, 
				'article_id' => $article_info['id'], 
				'item_id' => $comment_id
			));
		}
		
		set_human_valid('answer_valid_hour');
		
		if ($article_info['uid'] != $uid)
		{
			$this->model('notify')->send($uid, $article_info['uid'], notify_class::TYPE_ARTICLE_NEW_COMMENT, notify_class::CATEGORY_ARTICLE, $article_info['id'], array(
				'from_uid' => $uid, 
				'article_id' => $article_info['id'], 
				'item_id' => $comment_id
			));
		}
				
		return $comment_id;
	}
	
	public function remove_article($article_id)
	{
		if (!$article_info = $this->get_article_info_by_id($article_id))
		{
			return false;
		}
		
		$this->delete('article_comments', "article_id = " . intval($article_id)); // 删除关联的回复内容

		$this->delete('topic_relation', "`type` = 'article' AND item_id = " . intval($article_id));		// 删除话题关联
				
		ACTION_LOG::delete_action_history('associate_type = ' . ACTION_LOG::CATEGORY_QUESTION . ' AND associate_action = ' . ACTION_LOG::ADD_ARTICLE .  ' AND associate_id = ' . intval($article_id));	// 删除动作
		
		// 删除附件
		if ($attachs = $this->model('publish')->get_attach('article', $article_id))
		{
			foreach ($attachs as $key => $val)
			{
				$this->model('publish')->remove_attach($val['id'], $val['access_key']);
			}
		}
		
		$this->model('notify')->delete_notify('model_type = 8 AND source_id = ' . intval($article_id));	// 删除相关的通知
		
		return $this->delete('article', 'id = ' . intval($article_id));	// 删除问题
	}
	
	public function remove_comment($comment_id)
	{
		if ($comment_info = $this->get_comment_by_id($comment_id))
		{
			$this->delete('article_comments', 'id = ' . intval($comment_id));
			
			$this->update('article', array(
				'comments' => $this->count('article_comments', 'article_id = ' . intval($article_id))
			), 'id = ' . $comment_info['id']);
			
			return true;
		}
	}
	
	public function update_article($article_id, $title, $message, $topics, $create_topic)
	{
		$this->delete('topic_relation', 'item_id = ' . intval($article_id) . " AND `type` = 'article'");
		
		if (is_array($topics))
		{
			foreach ($topics as $key => $topic_title)
			{
				$topic_id = $this->model('topic')->save_topic(null, $topic_title, $uid, null, $create_topic);
				
				$this->model('topic')->save_topic_relation($this->user_id, $topic_id, $article_id, 'article');
			}
		}
		
		return $this->update('article', array(
			'title' => htmlspecialchars($title),
			'message' => htmlspecialchars($message)
		), 'id = ' . intval($article_id));
	}
	
	public function get_articles_list_by_topic_ids($page, $per_page, $order_by, $topic_ids)
	{
		if (!$topic_ids)
		{
			return false;
		}
		
		if (!is_array($topic_ids))
		{
			$topic_ids = array(
				$topic_ids
			);
		}

		array_walk_recursive($topic_ids, 'intval_string');
		
		$result_cache_key = 'article_list_by_topic_ids_' . implode('_', $topic_ids) . '_' . md5($order_by . $page . $per_page);
		
		$found_rows_cache_key = 'article_list_by_topic_ids_found_rows_' . implode('_', $topic_ids) . '_' . md5($order_by . $page . $per_page);
			
		$where[] = 'topic_relation.topic_id IN(' . implode(',', $topic_ids) . ')';

		if (!$found_rows = AWS_APP::cache()->get($found_rows_cache_key))
		{
			$_found_rows = $this->query_row('SELECT COUNT(DISTINCT article.id) AS count FROM ' . $this->get_table('article') . ' AS article LEFT JOIN ' . $this->get_table('topic_relation') . " AS topic_relation ON article.id = topic_relation.item_id AND topic_relation.type = 'article' WHERE " . implode(' AND ', $where));
			
			$found_rows = $_found_rows['count'];
			
			AWS_APP::cache()->set($found_rows_cache_key, $found_rows, get_setting('cache_level_high'));
		}
		
		$this->questions_list_total = $found_rows;
		
		if (!$result = AWS_APP::cache()->get($result_cache_key))
		{
			$result = $this->query_all('SELECT article.* FROM ' . $this->get_table('article') . ' AS article LEFT JOIN ' . $this->get_table('topic_relation') . " AS topic_relation ON article.id = topic_relation.item_id AND topic_relation.type = 'article' WHERE " . implode(' AND ', $where) . ' GROUP BY article.id ORDER BY article.' . $order_by, calc_page_limit($page, $per_page));
			
			AWS_APP::cache()->set($result_cache_key, $result, get_setting('cache_level_high'));
		}
		
		return $result;
	}
	
	public function lock_article($article_id, $lock_status = true)
	{
		return $this->update('article', array(
			'lock' => intval($lock_status)
		), 'id = ' . intval($article_id));
	}
	
	public function article_vote($type, $item_id, $rating, $uid)
	{
		$this->delete('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id = " . intval($item_id) . ' AND uid = ' . intval($uid));
		
		if ($rating)
		{
			if ($article_vote = $this->fetch_row('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id = " . intval($item_id) . " AND rating = " . intval($rating) . ' AND uid = ' . intval($uid)))
			{			
				$this->update('article_vote', array(
					'rating' => intval($rating),
					'time' => time()
				), 'id = ' . intval($article_vote['id']));
			}
			else
			{
				$this->insert('article_vote', array(
					'type' => $type,
					'item_id' => intval($item_id),
					'rating' => intval($rating),
					'time' => time(),
					'uid' => intval($uid)
				));
			}
		}
		
		switch ($type)
		{
			case 'article':
				$this->update('article', array(
					'votes' => $this->count('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id = " . intval($item_id) . " AND rating = 1")
				), 'id = ' . intval($item_id));
			break;
			
			case 'comment':
				$this->update('article_comments', array(
					'votes' => $this->count('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id = " . intval($item_id) . " AND rating = 1")
				), 'id = ' . intval($item_id));
			break;
		}
		
		return true;
	}
	
	public function get_article_vote_by_id($type, $item_id, $uid = null)
	{
		$article_vote = $this->get_article_vote_by_ids($type, array(
			$item_id
		), $uid);
		
		return $article_vote[$item_id];
	}
	
	public function get_article_vote_by_ids($type, $item_ids, $uid)
	{
		if (! is_array($item_ids))
		{
			return false;
		}
		
		if (sizeof($item_ids) == 0)
		{
			return false;
		}
		
		array_walk_recursive($item_ids, 'intval_string');
		
		if ($article_votes = $this->fetch_all('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id IN(" . implode(',', array_unique($item_ids)) . ") AND uid = " . intval($uid)))
		{
			foreach ($article_votes AS $key => $val)
			{
				$result[$val['item_id']] = $val;
			}
		}
		
		return $result;
	}
	
	public function get_article_vote_users_by_id($type, $item_id, $limit = null)
	{
		if ($article_votes = $this->fetch_all('article_vote', "`type` = '" . $this->quote($type) . "' AND item_id = " . intval($item_id)))
		{
			foreach ($article_votes AS $key => $val)
			{
				$uids[$val['uid']] = $val['uid'];
			}
			
			return $this->model('account')->get_user_info_by_uids($uids);	
		}
	}
}
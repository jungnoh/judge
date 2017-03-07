CREATE DATABASE `judge`;
USE `judge`;
CREATE TABLE `languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `codename` varchar(30) NOT NULL,
  `compile` int(1) NOT NULL DEFAULT '1',
  `ace_lang` varchar(100) NOT NULL,
  `run_command` varchar(1000) NOT NULL,
  `compile_command` varchar(1000) NOT NULL,
  `source_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
CREATE TABLE `problem_stats` (
  `problem_id` int(11) NOT NULL,
  `submit_count` int(11) NOT NULL DEFAULT '0',
  `ac_count` int(11) NOT NULL DEFAULT '0',
  `ac_users_count` int(11) NOT NULL DEFAULT '0',
  `ce_count` int(11) NOT NULL DEFAULT '0',
  `re_count` int(11) NOT NULL DEFAULT '0',
  `me_count` int(11) NOT NULL DEFAULT '0',
  `wa_count` int(11) NOT NULL DEFAULT '0',
  `tle_count` int(11) NOT NULL DEFAULT '0',
  `ole_count` int(11) NOT NULL DEFAULT '0',
  UNIQUE KEY `problem_id` (`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `problems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `submit_count` int(11) NOT NULL DEFAULT '0',
  `accept_count` int(11) NOT NULL DEFAULT '0',
  `accept_users` int(11) NOT NULL DEFAULT '0',
  `description` text,
  `input_desc` text,
  `output_desc` text,
  `hint` text,
  `case_count` int(11) NOT NULL DEFAULT '3',
  `added_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(500) DEFAULT 'None',
  `time_limit` int(11) NOT NULL DEFAULT '1',
  `memory_limit` int(11) DEFAULT '256',
  `sample_input` text,
  `sample_output` text,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `type` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
CREATE TABLE `submit_history` (
  `submit_id` int(11) NOT NULL AUTO_INCREMENT,
  `submit_user_id` int(11) NOT NULL,
  `submit_user_name` varchar(20) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `lang` varchar(20) NOT NULL,
  `used_memory` int(11) NOT NULL DEFAULT '0',
  `used_time` int(11) NOT NULL DEFAULT '0',
  `error_msg` text NOT NULL,
  `submit_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `result` int(11) NOT NULL DEFAULT '0' COMMENT 'See enum resultValues',
  PRIMARY KEY (`submit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8;
CREATE TABLE `types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `description` mediumtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `organization` varchar(100) NOT NULL,
  `password` varchar(300) NOT NULL,
  `nickname` varchar(25) NOT NULL,
  `comment` text NOT NULL,
  `submit_count` int(11) NOT NULL DEFAULT '0',
  `ac_count` int(11) NOT NULL DEFAULT '0',
  `ac_problem_count` int(11) NOT NULL DEFAULT '0',
  `ce_count` int(11) NOT NULL DEFAULT '0',
  `re_count` int(11) NOT NULL DEFAULT '0',
  `me_count` int(11) NOT NULL DEFAULT '0',
  `wa_count` int(11) NOT NULL DEFAULT '0',
  `tle_count` int(11) NOT NULL DEFAULT '0',
  `ole_count` int(11) NOT NULL DEFAULT '0',
  `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `permissions` int(11) NOT NULL DEFAULT '1',
  `ac_rate` double GENERATED ALWAYS AS (coalesce(((`ac_count` * 100) / nullif(`submit_count`,0)),0)) VIRTUAL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8;
INSERT INTO `languages` VALUES (1,'C++','cpp',1,'ace/mode/c_cpp','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpprun\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cppbuild\",\"/workspace/runner\"]','source.cpp'),(2,'C++11','cpp11',1,'ace/mode/c_cpp','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp11run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp11build\",\"/workspace/runner\"]','source.cpp'),(3,'C++14','cpp14',1,'ace/mode/c_cpp','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp14run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp14build\",\"/workspace/runner\"]','source.cpp'),(4,'C99','c99',1,'ace/mode/c_cpp','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"c99run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"c99build\",\"/workspace/runner\"]','source.c');

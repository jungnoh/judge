CREATE DATABASE `judge`;
CREATE TABLE `judge`.`languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `codename` varchar(30) NOT NULL,
  `compile` int(1) NOT NULL DEFAULT 1,
  `ace_lang` varchar(100) NOT NULL,
  `run_command` varchar(1000) NOT NULL,
  `compile_command` varchar(1000) NOT NULL,
  `source_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
CREATE TABLE `judge`.`problems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `submit_count` int(11) NOT NULL DEFAULT '0',
  `accept_count` int(11) NOT NULL DEFAULT '0',
  `accept_users` int(11) NOT NULL DEFAULT '0',
  `description` text,
  `hint` text,
  `case_count` int(11) NOT NULL DEFAULT '3',
  `added_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(500) DEFAULT 'None',
  `time_limit` int(11) NOT NULL DEFAULT '1',
  `memory_limit` int(11) DEFAULT '256',
  `sample_input` text,
  `sample_output` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
CREATE TABLE `judge`.`problem_stats` (
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
CREATE TABLE `judge`.`submit_history` (
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
CREATE TABLE `judge`.`users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `organization` varchar(100) NOT NULL,
  `password` varchar(300) NOT NULL,
  `nickname` varchar(25) NOT NULL,
  `comment` text NOT NULL,
  `submit_count` int(11) NOT NULL DEFAULT '0',
  `ac_count` int(11) NOT NULL DEFAULT '0',
  `ce_count` int(11) NOT NULL DEFAULT '0',
  `re_count` int(11) NOT NULL DEFAULT '0',
  `me_count` int(11) NOT NULL DEFAULT '0',
  `wa_count` int(11) NOT NULL DEFAULT '0',
  `tle_count` int(11) NOT NULL DEFAULT '0',
  `ole_count` int(11) NOT NULL DEFAULT '0',
  `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `permissions` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `judge`.`languages` (`id`, `name`, `codename`, `ace_lang`, `compile`, `run_command`, `compile_command`, `source_name`) VALUES
(1, 'C++', 'cpp', 'ace/mode/c_cpp',1,'["run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpprun\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cppbuild\",\"/workspace/runner\"]','source.cpp'),
(2, 'C++11', 'cpp11', 'ace/mode/c_cpp',1,'[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp11run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp11build\",\"/workspace/runner\"]','source.cpp'),
(3, 'C++14', 'cpp14', 'ace/mode/c_cpp',1,'[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp14run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"cpp14build\",\"/workspace/runner\"]','source.cpp'),
(4, 'C99', 'c99', 'ace/mode/c_cpp',1,'[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"c99run\",\"/workspace/runner\",\"{2}\",\"{3}\",\"-m\"]','[\"run\",\"-m=2G\",\"--network=none\",\"-v={0}/judge_tmp/{1}:/judgeData\",\"c99build\",\"/workspace/runner\"]','source.c');
INSERT INTO `judge`.`problems` (`id`, `title`, `submit_count`, `accept_count`, `accept_users`, `description`, `hint`, `case_count`, `added_date`, `source`, `time_limit`, `memory_limit`, `sample_input`, `sample_output`) VALUES
(1, 'Test Problem', 0, 0, 0, 'Print the sum of the given integer a, b.', '#include &lt;stdio.h&gt;<br/> int main() {<br/> int a,b;<br/> scanf(&quot;%d %d&quot;,&amp;a,&amp;b);<br/> printf(&quot;%d&quot;,a+b);<br/> }', 3, CURRENT_TIMESTAMP, 'studioh', 1, 256, '[ \"1 1\", \"3 5\" ]', '[ \"2\", \"8\" ]');
INSERT INTO `judge`.`problem_stats` (`problem_id`, `submit_count`, `ac_count`, `ac_users_count`, `ce_count`, `re_count`, `me_count`, `wa_count`, `tle_count`, `ole_count`) VALUES
(1, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `judge`.`users` (`user_id`, `id`, `email`, `organization`, `password`, `nickname`, `comment`, `submit_count`, `ac_count`, `ce_count`, `re_count`, `me_count`, `wa_count`, `tle_count`, `ole_count`, `last_login`, `permissions`) VALUES
(3, 'asdf', 'nope', 'admins', '$2a$10$s5PrwyVVnA.ycScb1EaG3.JpMjcqMWBZqBnTpFRR0fUK4chBlHdQK', 'admin', 'hi', 0, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP, 1);

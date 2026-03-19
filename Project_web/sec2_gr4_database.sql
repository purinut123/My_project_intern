-- Database: `project web
-- Dependencies are now respected: Accounts -> User -> Admins
--                                 Authors -> Books
--                                 Publishers -> Books

DROP DATABASE IF EXISTS PANELIST;
CREATE DATABASE IF NOT EXISTS `PANELIST` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `PANELIST`;

-- 1. Accounts (No Dependencies)
CREATE TABLE `Accounts` (
  `Account_id` varchar(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL primary key,
  `Email` varchar(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Role` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Status_A` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Accounts`
INSERT INTO `Accounts` (`Account_id`, `Email`, `Password`, `Role`, `Status_A`) VALUES
('AC001', 'ACCT@211.email.com', 'ACa', 'admin', 'Active' ),
('AC002', 'ACCT@211.email.com', '200b', 'user', 'Active' ),
('AC003', 'ACCT@211.email.com', '300c', 'user', 'Active' ),
('AC004', 'ACCT@212.email.com', '400d', 'user', 'Suspended' ),
('AC005', 'ACCT@212.email.com', '500e', 'admin', 'Suspended' );

-- --------------------------------------------------------

-- 2. Users (Depends on Accounts)
CREATE TABLE `Users` (
  `User_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Username` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Name` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Surname` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Gender` VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `ProfileUrl` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Birthdate` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Account_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Account_id`) REFERENCES `Accounts`(`Account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Users`
INSERT INTO `Users` (`User_id`, `Account_id` , `Username`, `Name`, `Surname`, `Gender`, `ProfileUrl`, `Birthdate`) VALUES
('U001', 'AC001','john_doe', 'John', 'Doe', 'M', 'https://image.demorgen.be/162837593/width/2480/andras-arato-beter-bekend-als-hide-the-pain-harold-ik-heb', '1990-01-15'),
('U002', 'AC002','jane_lee', 'Jane', 'Lee', 'F', 'avatar2.jpg', '1992-06-20'),
('U003', 'AC003','mike_brown', 'Mike', 'Brown', 'M', NULL , '1988-12-05'),
('U004', 'AC004','alice_white', 'Alice', 'White', 'F', 'avatar4.jpg', '1995-03-30'),
('U005', 'AC005','bob_green', 'Bob', 'Green', 'M', 'avatar5.jpg', '1993-09-10');
-- --------------------------------------------------------

-- 3. Admins (Depends on Accounts and Users)
CREATE TABLE `Admins` (
  `Admin_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Location` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Telno` int(11) NOT NULL,
  `Account_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Account_id`) REFERENCES `Accounts`(`Account_id`),
  `User_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`User_id`) REFERENCES `Users`(`User_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Admins`
INSERT INTO `Admins` (`Admin_id`, `Account_id`, `User_id`, `Telno`, `Location`) VALUES
('A001', 'AC001', 'U001', 812345678, '47.62000,-122.34900'),
('A005', 'AC005', 'U005', 854321098, '33.8444,134.1559');

-- --------------------------------------------------------

-- 4. Authors (No Dependencies)
CREATE TABLE `Authors` (
  `Authors_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Name` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Authors`
INSERT INTO Authors (Authors_id, Name) VALUES
('AT001', 'Hajime Isayama'),
('AT002', 'Gege Akutami'),
('AT003', 'Tatsuya Endo'),
('AT004', 'Tatsuki Fujimoto'),
('AT005', 'Kohei Horikoshi'),
('AT006', 'Eiichiro Oda'),
('AT007', 'Koyoharu Gotouge'),
('AT008', 'Sui Ishida'),
('AT009', 'Chu-gong'), 
('AT010', 'Sing-Shong'), 
('AT011', 'Redice Studio'), 
('AT012', 'Reki Kawahara'),
('AT013', 'Rifujin na Magonote'),
('AT014', 'Kugane Maruyama'),
('AT015', 'Kumo Kagyu');

-- --------------------------------------------------------

-- 5. Publishers (No Dependencies)
CREATE TABLE `Publishers` (
  `Publishers_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Name` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Publishers`
INSERT INTO Publishers (Publishers_id, Name) VALUES
('P001', 'Kodansha'),
('P002', 'Shueisha'),
('P003', 'Kadokawa'),
('P004', 'D&C Media'),
('P005', 'KakaoPage'),
('P006', 'Naver Webtoon'),
('P007', 'Tapas Media'),
('P008', 'Square Enix'),
('P009', 'MF Bunko J'),
('P010', 'Enterbrain'),
('P011', 'GA Bunko'),
('P012', 'Dengeki Bunko'),
('P013', 'Munpia'),
('P014', 'Young Jump'),
('P015', 'Media Factory');

-- --------------------------------------------------------

-- 6. Books (Depends on Authors and Publishers)
CREATE TABLE `Books` (
  `Book_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Type` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Title` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OG_title` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Synopsis` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Genre` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Release_year` YEAR DEFAULT NULL,
  `Read_platform` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Status_B` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Rating` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `CoverUrl` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `Authors_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Authors_id`) REFERENCES `Authors`(`Authors_id`),
  `Publishers_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Publishers_id`) REFERENCES `Publishers`(`Publishers_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Books`
-- Sample manga data
INSERT INTO `Books` (`Book_id`,`Authors_id`,`Publishers_id`, `Type`, `Title`,`OG_title`, `Synopsis`, `Genre`, `Release_year`, `Read_platform`, `Status_B`, `Rating`, `CoverUrl`) VALUES
('B001','AT001','P001', 'manga','Attack on Titan', 'Shingeki no Kyojin', 'Humanity fights colossal humanoid giants in a world ruled by fear and walls.', 'Action/Dark Fantasy', 2009,'Bessatsu Shōnen Magazine', 'completed', 'Teen', 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10701949_b_v9_ah.jpg'),
('B002','AT002','P002', 'manga', 'Jujutsu Kaisen', 'Jujutsu Kaisen', 'A high school student joins a secret organization of Jujutsu Sorcerers to fight curses.', 'Supernatural/Action', 2018, 'Weekly Shōnen Jump', 'ongoing', 'Teen', 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg'),
('B003','AT003','P002', 'manga', 'Spy x Family', 'Spy x Family', 'A spy, an assassin, and a telepath pose as a family to execute a top-secret mission.', 'Comedy/Action', 2019, 'Shōnen Jump+', 'ongoing', 'All ages', 'https://du.lnwfile.com/_webp_max_images/1024/1024/16/9w/1m.webp'),
('B004','AT004','P002', 'manga', 'Chainsaw Man', 'Chainsaw Man', 'A young man merges with a chainsaw devil to work for the Public Safety Devil Hunters.', 'Dark Fantasy/Horror', 2018, 'Weekly Shōnen Jump', 'completed', 'Mature', 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781974709939/chainsaw-man-vol-1-9781974709939_hr.jpg'),
('B005','AT005','P002', 'manga', 'My Hero Academia', 'Boku no Hīrō Akademia', 'In a world of superpowers, a boy without powers inherits one and enrolls in a hero academy.', 'Action/Superhero', 2014, 'Weekly Shōnen Jump', 'ongoing', 'Teen', 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781974759187/my-hero-academia-vol-42-9781974759187_hr.jpg'),
('B006','AT007','P002', 'manga', 'Demon Slayer', 'Kimetsu no Yaiba', 'A boy seeks to turn his demon sister back into a human and avenge his family.', 'Action/Historical', 2016, 'Weekly Shōnen Jump', 'completed', 'Teen', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlTK68wcT-CXqXCMDDlcXRpXaPpHR6x334qbvtgCeK62MZ6JkyWJaNK3ye8fy3L9eZW8Y&usqp=CAU'),
('B007','AT006','P002', 'manga', 'One Piece', 'One Piece', 'A pirate sets sail with his crew to find the ultimate treasure, the One Piece.', 'Adventure/Fantasy', 1997, 'Weekly Shōnen Jump', 'ongoing', 'Teen', 'https://jumpichiban.com/cdn/shop/files/ONEPIECE112.jpg?v=1754209878'),
('B008','AT008','P014', 'manga', 'Tokyo Ghoul', 'Tōkyō Gūru', 'A student survives an attack by a Ghoul and becomes a half-Ghoul, hiding his identity.', 'Dark Fantasy/Horror', 2011, 'Young Jump', 'completed', 'Mature', 'https://storage.naiin.com/system/application/bookstore/resource/product/201703/211088/6000024922_front_XXL.jpg'),
('B009','AT004','P002', 'manga', 'Fire Punch', 'Fire Punch', 'A man with regenerative powers seeks revenge in a frozen post-apocalyptic world.', 'Sci-Fi/Horror', 2016, 'Shōnen Jump+', 'completed', 'Mature', 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781421598086/fire-punch-vol-4-9781421598086_hr.jpg'),
('B010','AT005','P002', 'manga', 'Vigilantes', 'Vigilante: Boku no Hero Academia Illegals', 'Spinoff exploring heroes who operate outside the law in the MHA universe.', 'Action/Superhero', 2016, 'Shōnen Jump+', 'completed', 'Teen', 'https://upload.wikimedia.org/wikipedia/en/2/25/My_Hero_Academia_Vigilantes_Volume_1.jpg');
 
-- Sameple manhwa data
INSERT INTO `Books` (`Book_id`,`Authors_id`,`Publishers_id`, `Type`, `Title`,`OG_title`, `Synopsis`, `Genre`, `Release_year`, `Read_platform`, `Status_B`, `Rating`, `CoverUrl`) VALUES
('B011','AT009','P004', 'manhwa', 'Solo Leveling', 'Na Honjaman Rebeleop', 'A weak hunter gains a secret system that allows him to level up without limits.', 'Action/Fantasy', 2018, 'KakaoPage', 'completed', 'Teen', 'https://static.wixstatic.com/media/1cf3ac_6ea6668ada5d48fe95b269a9177c2e3e~mv2.png/v1/fill/w_480,h_720,al_c,lg_1,q_85/1cf3ac_6ea6668ada5d48fe95b269a9177c2e3e~mv2.png'),
('B012','AT011','P006', 'manhwa', 'Tomb Raider King', 'Muwangui Myodeom', 'A resurrected relic hunter uses knowledge of the future to retrieve powerful artifacts.', 'Action/Adventure', 2019, 'Naver Webtoon', 'ongoing', 'Teen', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIF3jiTjC6Z0bNjWQpN_y45SRZWXmOtuXX2g&s'),
('B013','AT010','P005', 'manhwa', 'SSS-Class Suicide Hunter', 'SSS-Geup Jasal Heonteo', 'A hunter copies skills and gains the ability to return in time upon death, becoming the strongest by dying.', 'Fantasy/Isekai', 2020, 'KakaoPage', 'ongoing', 'Teen', 'https://preview.redd.it/sss-class-suicide-hunter-this-manhwa-is-better-than-i-v0-gld57ag9i0ec1.jpeg?auto=webp&s=6440958b3ce3f0061262d9473a9e8aa6014fe43b'),
('B014','AT013','P007', 'manhwa', 'The Beginning After The End', 'Eondeuke Seon Saebyeok', 'A king is reincarnated as a common boy in a world of magic and monsters.', 'Fantasy/Isekai', 2018, 'Tapas Media', 'ongoing', 'Teen', 'https://us-a.tapas.io/sa/f7/16e8def2-901b-45ea-8d86-2aa4b05cc86b_z.jpg'),
('B015','AT010','P005', 'manhwa', 'Omniscient Reader', 'Jeonjijeok Dokja Sijeom', 'A man realizes the world is turning into the novel he just finished reading.', 'Fantasy/Action', 2018, 'KakaoPage', 'ongoing', 'Teen', 'https://i.redd.it/mruzc5uf6zbc1.jpeg'),
('B016','AT008','P006', 'manhwa', 'Lookism', 'Oemojisangjuui', 'A high school student who is bullied gains the ability to switch between two bodies.', 'Slice of Life/Drama', 2014, 'Naver Webtoon', 'ongoing', 'Teen', 'https://upload.wikimedia.org/wikipedia/en/1/17/Lookism_Volume_1_Cover.jpg'),
('B017','AT009','P005', 'manhwa', 'The Return of the Mount Hua Sect', 'Hwasan Gwi Hwan', 'The strongest swordsman of a past sect is reborn to revive his fallen home.', 'Action/Martial Arts', 2020, 'KakaoPage', 'ongoing', 'Teen', 'https://i.redd.it/p3tckzd3sjwe1.jpeg'),
('B018','AT003','P006', 'manhwa', 'The Boxer', 'The Boxer', 'A troubled boy with inhuman talent enters the unforgiving world of professional boxing.', 'Sports/Drama', 2019, 'Naver Webtoon', 'completed', 'Teen', 'https://i.redd.it/j4m6rxlu10uc1.jpeg'),
('B019','AT004','P006', 'manhwa', 'Mercenary Enrollment', 'Ibyeong-yongbyeong', 'A boy who survived years as a mercenary returns to high school life in South Korea.', 'Action/School Life', 2020, 'Naver Webtoon', 'ongoing', 'Teen', 'https://preview.redd.it/mercenary-enrolment-people-keep-suggesting-me-to-read-this-v0-1jg9d3jr0fya1.png?auto=webp&s=821320bac1266c8ace42f93d1381a7cd0bc3f87c'),
('B020','AT011','P004', 'manhwa', 'Nano Machine', 'Nano Machine', 'A demonic cult member is injected with a nano machine from the future, changing his fate.', 'Action/Martial Arts', 2020, 'D&C Media', 'ongoing', 'Teen', 'https://i.redd.it/ayut0tsees0d1.jpeg'  );

-- Sample novel data
INSERT INTO `Books` (`Book_id`,`Authors_id`,`Publishers_id`, `Type`, `Title`,`OG_title`, `Synopsis`, `Genre`, `Release_year`, `Read_platform`, `Status_B`, `Rating`, `CoverUrl`) VALUES
('B021','AT012','P012', 'novel', 'Sword Art Online', 'Sōdo Āto Onrain', 'A group of players are trapped in a virtual reality MMORPG and must clear the game to escape.', 'Sci-Fi/Isekai', 2009, 'Dengeki Bunko', 'ongoing', 'Teen', 'https://m.media-amazon.com/images/I/910Ins4uSjL._AC_UF1000,1000_QL80_.jpg'),
('B022','AT013','P003', 'novel', 'Mushoku Tensei', 'Mushoku Tensei: Isekai Ittara Honki Dasu', 'A 34-year-old NEET is reincarnated into a fantasy world with magical talent.', 'Fantasy/Isekai', 2012, 'Kadokawa', 'completed', 'Mature', 'https://laz-img-sg.alicdn.com/p/660e0d908905cebcad411cef3fb73b11.jpg'),
('B023','AT014','P010', 'novel', 'Overlord', 'Ōbārōdo', 'A powerful guild master is transported to a new world as his video game avatar, Ainz Ooal Gown.', 'Dark Fantasy/Isekai', 2012, 'Enterbrain', 'ongoing', 'Mature', 'https://preview.redd.it/today-released-on-kindle-guys-v0-n4fodubvwncb1.jpg?width=640&crop=smart&auto=webp&s=f519878d145c392a8b9b695e6ae042690cc78a8d'),
('B024','AT015','P011', 'novel', 'Goblin Slayer', 'Goburin Sureiyā', 'An adventurer only accepts quests to kill goblins, regardless of how minor the threats may seem.', 'Dark Fantasy/Action', 2016, 'GA Bunko', 'ongoing', 'Mature', 'https://m.media-amazon.com/images/I/91Y2pxnGoYL._AC_UF1000,1000_QL80_.jpg'),
('B025','AT007','P009', 'novel', 'Re:Zero - Starting Life in Another World', 'Re:Zero kara Hajimeru Isekai Seikatsu', 'A shut-in is summoned to a fantasy world with the sole power to return from death.', 'Fantasy/Thriller', 2014, 'MF Bunko J', 'ongoing', 'Teen', 'https://storage.naiin.com/system/application/bookstore/resource/product/202208/557836/1000253468_front_XXL.jpg'),
('B026','AT003','P009', 'novel', 'Classroom of the Elite', 'Yōkoso Jitsuryoku Shijō Shugi no Kyōshitsu e', 'A student with exceptional intelligence joins a highly competitive high school where merit is everything.', 'School/Thriller', 2015, 'MF Bunko J', 'ongoing', 'Teen', 'https://m.media-amazon.com/images/I/81d3J1SouWL._UF1000,1000_QL80_.jpg'),
('B027','AT011','P013', 'novel', 'God of Cooking', 'Yoriwang', 'A talented chef dies and receives a system that allows him to master cooking skills.', 'Slice of Life/Cooking', 2015, 'Munpia', 'completed', 'All ages', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJHjbYsv-VsuZu2gVYopouAma-hzEWC7WJnQ&s'),
('B028','AT009','P004', 'novel', 'Solo Leveling (novel)', 'Na Honjaman Rebeleop', 'Jinwoo continues to grow stronger and fight against external threats to Earth.', 'Action/Fantasy', 2016, 'D&C Media', 'completed', 'Teen', 'https://upload.wikimedia.org/wikipedia/en/6/6c/Solo_Leveling_Volume_1_Cover.jpg'),
('B029','AT010','P005', 'novel', 'The Second Coming of Gluttony', 'Pogsig-ui Jaeollim', 'A selfish gambler gains a second chance at life to change his fate in a mysterious dimension.', 'Action/Fantasy', 2016, 'KakaoPage', 'completed', 'Mature', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuEUqSr-Q6JhlygfmMZ_Yl-2yb90QFnfyoqQ&s'),
('B030','AT006','P015', 'novel', 'The Melancholy of Haruhi Suzumiya', 'Suzumiya Haruhi no Yūutsu', 'A normal student finds himself drawn into a mysterious club formed by an eccentric girl.', 'Sci-Fi/School', 2003, 'Sneaker Bunko', 'hiatus', 'Teen', 'https://m.media-amazon.com/images/I/81Qyg0JwqwL._AC_UF1000,1000_QL80_.jpg');

-- --------------------------------------------------------

-- 7. Reviews (Depends on Accounts and Books)
CREATE TABLE `Reviews` (
  `Review_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL PRIMARY KEY,
  `Score` INT DEFAULT 0,
  `Content` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `GifUrl` VARCHAR(500) DEFAULT NULL,
  `Account_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Account_id`) REFERENCES `Accounts`(`Account_id`),
  `Book_id` VARCHAR(8) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  FOREIGN KEY (`Book_id`) REFERENCES `Books`(`Book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Dumping data for table `Reviews`
INSERT INTO `Reviews` (`Review_id`, `Account_id`, `Book_id`, `Score`, `Content`, `GifUrl`) VALUES
('R001', 'AC001', 'B001', 5, 'Great manga, really enjoyed it!', NULL),
('R002', 'AC002', 'B002', 3, 'The series was okay, but a bit slow in some episodes.', NULL),
('R003', 'AC003', 'B003', 4, 'Amazing documentary, learned a lot about the ocean.', NULL),
('R004', 'AC004', 'B004', 4, 'The plot was confusing at times, but the acting was superb.', NULL),
('R005', 'AC005', 'B005', 5, 'Loved the historical accuracy in this series!', NULL);

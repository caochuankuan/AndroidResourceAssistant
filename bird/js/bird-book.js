// 小鸟数据
const birdsData = [
    {"i":1,"name":"麻雀","period":1,"ws":50,"we":150,"exp":10,"skill":null,"baitName":"谷子","baitField":"彩虹树林"},
    {"i":2,"name":"燕子","period":1,"ws":50,"we":150,"exp":10,"skill":null,"baitName":"燕麦","baitField":"彩虹树林"},
    {"i":3,"name":"乌鸦","period":1,"ws":50,"we":300,"exp":18,"skill":null,"baitName":"燕麦","baitField":"彩虹树林"},
    {"i":4,"name":"喜鹊","period":1,"ws":50,"we":250,"exp":14,"skill":{"skillId":1004,"position":"s1","skillName":"报喜","skillDescription":"增加自身重量3斤"},"baitName":"大豆","baitField":"彩虹树林"},
    {"i":5,"name":"野鸭","period":5,"ws":200,"we":500,"exp":50,"skill":null,"baitName":"大米","baitField":"彩虹树林"},
    {"i":6,"name":"鹌鹑","period":1,"ws":20,"we":100,"exp":6,"skill":null,"baitName":"大豆","baitField":"彩虹树林"},
    {"i":7,"name":"鸽子","period":7,"ws":100,"we":350,"exp":25,"skill":null,"baitName":"大米","baitField":"彩虹树林"},
    {"i":8,"name":"山鸡","period":19,"ws":200,"we":600,"exp":70,"skill":null,"baitName":"大米","baitField":"彩虹树林"},
    {"i":9,"name":"鹦鹉","period":5,"ws":150,"we":350,"exp":28,"skill":{"skillId":1009,"position":"s1","skillName":"学舌术","skillDescription":"减少所有敌人重量1斤(最低降为0.1斤,70几率发动)"},"baitName":"玉米","baitField":"彩虹树林"},
    {"i":10,"name":"猫头鹰","period":15,"ws":200,"we":500,"exp":79,"skill":null,"baitName":"小鱼","baitField":"彩虹树林"},
    {"i":11,"name":"黄鹂","period":5,"ws":50,"we":200,"exp":20,"skill":null,"baitName":"松子","baitField":"彩虹树林"},
    {"i":12,"name":"金丝雀","period":1,"ws":20,"we":80,"exp":5,"skill":{"skillId":1012,"position":"s1","skillName":"象牙笼","skillDescription":"提高自身克制值70%"},"baitName":"松子","baitField":"彩虹树林"},
    {"i":13,"name":"松鸡","period":80,"ws":300,"we":800,"exp":230,"skill":null,"baitName":"松子","baitField":"彩虹树林"},
    {"i":14,"name":"啄木鸟","period":15,"ws":200,"we":600,"exp":68,"skill":null,"baitName":"白蚁","baitField":"彩虹树林"},
    {"i":15,"name":"大雁","period":120,"ws":600,"we":1200,"exp":260,"skill":null,"baitName":"草鱼","baitField":"彩虹树林"},
    {"i":16,"name":"斑鸠","period":6,"ws":200,"we":500,"exp":40,"skill":null,"baitName":"白蚁","baitField":"彩虹树林"},
    {"i":17,"name":"鹧鸪","period":12,"ws":300,"we":600,"exp":55,"skill":null,"baitName":"白蚁","baitField":"彩虹树林"},
    {"i":18,"name":"山鹰","period":160,"ws":500,"we":1000,"exp":240,"skill":{"skillId":1018,"position":"s2","skillName":"鹰眼","skillDescription":"增加自身重量25%"},"baitName":"偷蛋猪","baitField":"彩虹树林"},
    {"i":19,"name":"愤怒小鸟","period":1,"ws":40,"we":50,"exp":2,"skill":{"skillId":1019,"position":"s1","skillName":"怒火冲天","skillDescription":"个人竞技场中，自身重量提升40%"},"baitName":"偷蛋猪","baitField":"彩虹树林"},
    {"i":20,"name":"秧鸡","period":2,"ws":50,"we":100,"exp":6,"skill":null,"baitName":"水草籽","baitField":"飞翔岛屿"},
    {"i":21,"name":"鹈鹕","period":100,"ws":500,"we":1400,"exp":350,"skill":null,"baitName":"小鱼苗","baitField":"飞翔岛屿"},
    {"i":22,"name":"鸬鹚","period":25,"ws":400,"we":800,"exp":86,"skill":null,"baitName":"小鱼苗","baitField":"飞翔岛屿"},
    {"i":23,"name":"翠鸟","period":5,"ws":100,"we":300,"exp":20,"skill":null,"baitName":"水草籽","baitField":"飞翔岛屿"},
    {"i":24,"name":"鹭鸶","period":150,"ws":800,"we":1600,"exp":350,"skill":{"skillId":1024,"position":"s1","skillName":"白流光","skillDescription":"自身重量上升转生次数*10%"},"baitName":"小鱼苗","baitField":"飞翔岛屿"},
    {"i":25,"name":"海鸥","period":9,"ws":300,"we":600,"exp":45,"skill":null,"baitName":"小贝壳","baitField":"飞翔岛屿"},
    {"i":26,"name":"军舰鸟","period":30,"ws":500,"we":1000,"exp":160,"skill":null,"baitName":"小螃蟹","baitField":"飞翔岛屿"},
    {"i":27,"name":"鸳鸯","period":8,"ws":200,"we":400,"exp":22,"skill":{"skillId":1027,"position":"s2","skillName":"出双入对","skillDescription":"增加本方所有魔法类型小鸟重量6%"},"baitName":"并蒂莲子","baitField":"飞翔岛屿"},
    {"i":28,"name":"海雀","period":3,"ws":100,"we":300,"exp":22,"skill":null,"baitName":"水仙茎","baitField":"飞翔岛屿"},
    {"i":29,"name":"水雉","period":5,"ws":400,"we":500,"exp":32,"skill":null,"baitName":"水仙茎","baitField":"飞翔岛屿"},
    {"i":30,"name":"信天翁","period":28,"ws":700,"we":900,"exp":136,"skill":null,"baitName":"小乌贼","baitField":"飞翔岛屿"},
    {"i":31,"name":"大贼鸥","period":38,"ws":800,"we":1200,"exp":140,"skill":{"skillId":1031,"position":"s2","skillName":"贼眼","skillDescription":"个人竞技场中，战斗胜利后额外获得2点经验值"},"baitName":"小乌贼","baitField":"飞翔岛屿"},
    {"i":32,"name":"潜鸟","period":6,"ws":300,"we":400,"exp":40,"skill":null,"baitName":"螺丝","baitField":"飞翔岛屿"},
    {"i":33,"name":"鹳","period":21,"ws":1000,"we":1200,"exp":140,"skill":null,"baitName":"螺丝","baitField":"飞翔岛屿"},
    {"i":34,"name":"火烈鸟","period":200,"ws":1200,"we":1800,"exp":350,"skill":{"skillId":1034,"position":"s1","skillName":"赤","skillDescription":"减少所有敌人重量5%"},"baitName":"螺丝","baitField":"飞翔岛屿"},
    {"i":35,"name":"雨燕","period":1,"ws":100,"we":200,"exp":10,"skill":null,"baitName":"水蜘蛛","baitField":"飞翔岛屿"},
    {"i":36,"name":"企鹅","period":100,"ws":600,"we":2200,"exp":450,"skill":{"skillId":1036,"position":"s1","skillName":"肥硕","skillDescription":"增加自身初始重量3斤"},"baitName":"小乌贼","baitField":"飞翔岛屿"},
    {"i":37,"name":"天鹅","period":160,"ws":1000,"we":2400,"exp":500,"skill":{"skillId":1037,"position":"s1","skillName":"荡波","skillDescription":"减少对手重量20%"},"baitName":"鳕鱼","baitField":"飞翔岛屿"},
    {"i":38,"name":"极速小鸟","period":4,"ws":100,"we":300,"exp":4,"skill":{"skillId":1038,"position":"s1","skillName":"光速","skillDescription":"增加自身重量10%"},"baitName":"抢蛋猪","baitField":"飞翔岛屿"},
    {"i":39,"name":"仙鹤","period":480,"ws":1500,"we":3000,"exp":600,"skill":{"skillId":1039,"position":"s1","skillName":"祥瑞","skillDescription":"增加本方所有小鸟技能释放概率1~5%,最高90%"},"baitName":"锦鲤","baitField":"飞翔岛屿"},
    {"i":40,"name":"沙鸡","period":3,"ws":300,"we":600,"exp":30,"skill":null,"baitName":"蚯蚓","baitField":"惊厥草原"},
    {"i":41,"name":"火鸡","period":40,"ws":800,"we":1400,"exp":183,"skill":null,"baitName":"蚯蚓","baitField":"惊厥草原"},
    {"i":42,"name":"蜂鸟","period":2,"ws":100,"we":200,"exp":5,"skill":null,"baitName":"蚜虫","baitField":"惊厥草原"},
    {"i":43,"name":"百灵","period":5,"ws":200,"we":400,"exp":12,"skill":{"skillId":1043,"position":"s2","skillName":"轻歌","skillDescription":"减少所有敌人克制值40%"},"baitName":"蚜虫","baitField":"惊厥草原"},
    {"i":44,"name":"杜鹃","period":100,"ws":500,"we":1000,"exp":120,"skill":null,"baitName":"毛毛虫","baitField":"惊厥草原"},
    {"i":45,"name":"布谷鸟","period":10,"ws":300,"we":800,"exp":50,"skill":null,"baitName":"毛毛虫","baitField":"惊厥草原"},
    {"i":46,"name":"夜莺","period":3,"ws":490,"we":500,"exp":30,"skill":{"skillId":1046,"position":"s3","skillName":"轮舞曲","skillDescription":"增加本方所有小鸟克制值30%"},"baitName":"花蜜","baitField":"惊厥草原"},
    {"i":47,"name":"鹗","period":40,"ws":1000,"we":1800,"exp":200,"skill":null,"baitName":"青蛙","baitField":"惊厥草原"},
    {"i":48,"name":"红隼","period":100,"ws":1200,"we":1600,"exp":180,"skill":null,"baitName":"青蛙","baitField":"惊厥草原"},
    {"i":49,"name":"伯劳","period":28,"ws":600,"we":1800,"exp":250,"skill":null,"baitName":"独角仙","baitField":"惊厥草原"},
    {"i":50,"name":"大鸨","period":400,"ws":1500,"we":3000,"exp":700,"skill":{"skillId":1050,"position":"s2","skillName":"百妻","skillDescription":"增加自身克制值50%"},"baitName":"独角仙","baitField":"惊厥草原"},
    {"i":51,"name":"鹞","period":19,"ws":1400,"we":1800,"exp":200,"skill":null,"baitName":"兔子","baitField":"惊厥草原"},
    {"i":52,"name":"鸸鹋","period":540,"ws":3000,"we":4000,"exp":1000,"skill":null,"baitName":"仙人掌","baitField":"惊厥草原"},
    {"i":53,"name":"金雕","period":360,"ws":2000,"we":3500,"exp":620,"skill":{"skillId":1053,"position":"s3","skillName":"御风","skillDescription":"增加自身重量25%，克制值50%"},"baitName":"兔子","baitField":"惊厥草原"},
    {"i":54,"name":"苍鹰","period":90,"ws":1000,"we":3000,"exp":360,"skill":{"skillId":1054,"position":"s1","skillName":"狙击冲锋","skillDescription":"减少对手成长值0.2%"},"baitName":"兔子","baitField":"惊厥草原"},
    {"i":55,"name":"犀鸟","period":3,"ws":200,"we":400,"exp":12,"skill":null,"baitName":"田鼠","baitField":"惊厥草原"},
    {"i":56,"name":"鸵鸟","period":700,"ws":3000,"we":6000,"exp":1800,"skill":{"skillId":1056,"position":"s1","skillName":"伪装","skillDescription":"增加自身重量40%"},"baitName":"仙人掌","baitField":"惊厥草原"},
    {"i":57,"name":"分裂鸟","period":20,"ws":790,"we":800,"exp":20,"skill":{"skillId":1057,"position":"s3","skillName":"幻影法","skillDescription":"减少所有敌人重量5%，克制比例10%"},"baitName":"头盔猪","baitField":"惊厥草原"},
    {"i":58,"name":"秃鹫","period":300,"ws":3000,"we":5000,"exp":1000,"skill":{"skillId":1058,"position":"s1","skillName":"猎杀眼","skillDescription":"增加自身重量5%"},"baitName":"蛇","baitField":"惊厥草原"},
    {"i":59,"name":"旅鸽","period":11,"ws":400,"we":1000,"exp":60,"skill":null,"baitName":"鼻涕虫","baitField":"时光洞穴"},
    {"i":60,"name":"荆棘鸟","period":4,"ws":200,"we":500,"exp":18,"skill":{"skillId":1060,"position":"s2","skillName":"荆棘","skillDescription":"个人竞技场中，增加本方所有小鸟重量10%"},"baitName":"蜗牛","baitField":"时光洞穴"},
    {"i":61,"name":"红鸭","period":10,"ws":600,"we":1200,"exp":60,"skill":null,"baitName":"鼻涕虫","baitField":"时光洞穴"},
    {"i":62,"name":"秃鹃","period":60,"ws":1000,"we":1500,"exp":100,"skill":null,"baitName":"核桃","baitField":"时光洞穴"},
    {"i":63,"name":"黄嘴沙鸭","period":20,"ws":200,"we":800,"exp":30,"skill":null,"baitName":"核桃","baitField":"时光洞穴"},
    {"i":64,"name":"渡渡鸟","period":250,"ws":3000,"we":5000,"exp":900,"skill":{"skillId":1064,"position":"s2","skillName":"变化术","skillDescription":"将对手的类型强制转换为敏捷型"},"baitName":"黄杏","baitField":"时光洞穴"},
    {"i":65,"name":"果鸠","period":3,"ws":300,"we":600,"exp":22,"skill":null,"baitName":"蜗牛","baitField":"时光洞穴"},
    {"i":66,"name":"几维鸟","period":30,"ws":400,"we":1200,"exp":60,"skill":{"skillId":1066,"position":"s3","skillName":"三足","skillDescription":"增加自身重量10%，克制值70%"},"baitName":"黄杏","baitField":"时光洞穴"},
    {"i":67,"name":"太平鸟","period":1,"ws":200,"we":300,"exp":4,"skill":null,"baitName":"蜗牛","baitField":"时光洞穴"},
    {"i":68,"name":"极乐鸟","period":120,"ws":1000,"we":3000,"exp":400,"skill":{"skillId":1068,"position":"s1","skillName":"沉醉","skillDescription":"减少对手重量10%"},"baitName":"小蜥蜴","baitField":"时光洞穴"},
    {"i":69,"name":"太阳鸟","period":2,"ws":10,"we":50,"exp":1,"skill":null,"baitName":"毒蜘蛛","baitField":"时光洞穴"},
    {"i":70,"name":"回转小鸟","period":18,"ws":1000,"we":2000,"exp":128,"skill":{"skillId":1070,"position":"s2","skillName":"回旋舞","skillDescription":"减少对手等级3级（65%几率发动,仅限本场战斗）"},"baitName":"钢盔猪","baitField":"时光洞穴"},
    {"i":71,"name":"恐鸟","period":240,"ws":6000,"we":10000,"exp":2300,"skill":{"skillId":1071,"position":"s2","skillName":"恐惧尖叫","skillDescription":"增加本方所有小鸟克制值40%"},"baitName":"恐龙蛋","baitField":"时光洞穴"},
    {"i":72,"name":"象鸟","period":1200,"ws":12000,"we":25000,"exp":8000,"skill":{"skillId":1072,"position":"s1","skillName":"怪力","skillDescription":"增加自身重量和克制比例7%"},"baitName":"钢盔猪","baitField":"时光洞穴"},
    {"i":73,"name":"始祖鸟","period":450,"ws":8000,"we":16000,"exp":4500,"skill":null,"baitName":"恐龙蛋","baitField":"时光洞穴"},
    {"i":74,"name":"翼龙","period":900,"ws":10000,"we":20000,"exp":5000,"skill":{"skillId":1074,"position":"s3","skillName":"远古意志","skillDescription":"减少对手重量7%，克制比例15%"},"baitName":"鼠龙","baitField":"时光洞穴"},
    {"i":75,"name":"金鹅","period":5,"ws":1000,"we":2500,"exp":80,"skill":{"skillId":1075,"position":"s1","skillName":"金雨","skillDescription":"个人竞技场中，战斗胜利后额外获得250金币"},"baitName":"蓝宝石","baitField":"梦想花园"},
    {"i":76,"name":"精卫","period":2,"ws":200,"we":400,"exp":6,"skill":{"skillId":1076,"position":"s1","skillName":"填海","skillDescription":"减少对手重量5%"},"baitName":"蓝宝石","baitField":"梦想花园"},
    {"i":77,"name":"青鸟","period":30,"ws":2000,"we":4000,"exp":260,"skill":{"skillId":1077,"position":"s3","skillName":"青","skillDescription":"增加本方所有小鸟成长值0.3%"},"baitName":"曼陀罗花","baitField":"梦想花园"},
    {"i":78,"name":"七彩孔雀","period":60,"ws":3000,"we":6000,"exp":500,"skill":{"skillId":1078,"position":"s2","skillName":"霞光","skillDescription":"加本方所有小鸟技能释放概率3%，重量3%"},"baitName":"曼陀罗花","baitField":"梦想花园"},
    {"i":79,"name":"狮鹫","period":900,"ws":10000,"we":30000,"exp":9000,"skill":{"skillId":1079,"position":"s3","skillName":"狂吼","skillDescription":"增加自身克制比例30%"},"baitName":"狼肉","baitField":"梦想花园"},
    {"i":80,"name":"比翼鸟","period":22,"ws":200,"we":2200,"exp":88,"skill":{"skillId":1080,"position":"s2","skillName":"至死不渝","skillDescription":"增加本方所有敏捷类型小鸟重量20%"},"baitName":"孪生果","baitField":"梦想花园"},
    {"i":81,"name":"雷鸟","period":480,"ws":13000,"we":28000,"exp":7000,"skill":null,"baitName":"狼肉","baitField":"梦想花园"},
    {"i":82,"name":"三足乌","period":49,"ws":2900,"we":3000,"exp":69,"skill":null,"baitName":"火球","baitField":"梦想花园"},
    {"i":83,"name":"鸾鸟","period":200,"ws":5000,"we":8000,"exp":499,"skill":{"skillId":1083,"position":"s3","skillName":"求凤","skillDescription":"增加本方所有小鸟重量和克制比例10%"},"baitName":"火球","baitField":"梦想花园"},
    {"i":84,"name":"朱雀","period":6,"ws":1000,"we":2000,"exp":50,"skill":{"skillId":1084,"position":"s1","skillName":"炙热","skillDescription":"减少所有敌人重量3%"},"baitName":"火球","baitField":"梦想花园"},
    {"i":85,"name":"九头鸟","period":399,"ws":9000,"we":27000,"exp":4999,"skill":null,"baitName":"虎肉","baitField":"梦想花园"},
    {"i":86,"name":"毕方","period":666,"ws":25000,"we":33300,"exp":6800,"skill":null,"baitName":"虎肉","baitField":"梦想花园"},
    {"i":87,"name":"炸弹小鸟","period":18,"ws":10,"we":1000,"exp":180,"skill":{"skillId":1087,"position":"s3","skillName":"轰爆弹","skillDescription":"增加自身重量和克制比例15%×己方已阵亡小鸟数"},"baitName":"三味真火","baitField":"梦想花园"},
    {"i":88,"name":"赤鷩","period":240,"ws":12000,"we":22000,"exp":1500,"skill":{"skillId":1088,"position":"s2","skillName":"炎翼","skillDescription":"减少所有敌人成长值0.2%"},"baitName":"受伤的白兔","baitField":"梦想花园"},
    {"i":89,"name":"天使","period":777,"ws":15000,"we":45000,"exp":7000,"skill":{"skillId":1089,"position":"s2","skillName":"圣光","skillDescription":"不会受到自身重量下降的技能效果影响"},"baitName":"受伤的白兔","baitField":"梦想花园"},
    {"i":90,"name":"凤凰","period":888,"ws":30000,"we":50000,"exp":8000,"skill":{"skillId":1090,"position":"s3","skillName":"涅磐","skillDescription":"被击败时有可能复活并提升等级1级（35%几率发动,仅限本场战斗）"},"baitName":"梧桐籽","baitField":"梦想花园"},
    {"i":91,"name":"草鸡","period":4,"ws":500,"we":1500,"exp":80,"skill":{"skillId":1091,"position":"s3","skillName":"平凡之力","skillDescription":"增加自身重量8%×双方幻想型小鸟数量"},"baitName":"梧桐籽","baitField":"梦想花园"},
    {"i":92,"name":"神鹏","period":999,"ws":40000,"we":46000,"exp":9000,"skill":{"skillId":1092,"position":"s3","skillName":"万里","skillDescription":"增加自身重量20%×转生次数"},"baitName":"小神龙","baitField":"梦想花园"},
    {"i":93,"name":"皮卡丘","period":8,"ws":100,"we":1000,"exp":50,"skill":{"skillId":1093,"position":"s1","skillName":"十万伏特","skillDescription":"增加本方所有小鸟重量10%"},"baitName":"番茄酱","baitField":"飞翔岛屿"},
    {"i":94,"name":"流氓兔","period":15,"ws":800,"we":1500,"exp":80,"skill":null,"baitName":"月饼","baitField":"飞翔岛屿"},
    {"i":95,"name":"地狱凤凰","period":1000,"ws":40000,"we":100000,"exp":10000,"skill":null,"baitName":null,"baitField":null},
    {"i":96,"name":"迅雷兽","period":400,"ws":9000,"we":10000,"exp":1200,"skill":{"skillId":1096,"position":"s1","skillName":"爆雷之力","skillDescription":"增加自身重量50%,降低对手重量10%"},"baitName":"潘狐猴","baitField":"时光洞穴"},
    {"i":97,"name":"魅影兽","period":600,"ws":20000,"we":25000,"exp":5000,"skill":{"skillId":1097,"position":"s2","skillName":"消失代用","skillDescription":"增加本方所有力量类型小鸟重量30%"},"baitName":"闪雷兽","baitField":"时光洞穴"},
    {"i":98,"name":"迅雷幼兽","period":400,"ws":1500,"we":2200,"exp":200,"skill":{"skillId":1098,"position":"s1","skillName":"迅雷","skillDescription":"增加自身重量30%,降低对手重量5%"},"baitName":"潘狐幼猴","baitField":"飞翔岛屿"},
    {"i":99,"name":"魅影幼兽","period":600,"ws":2500,"we":3500,"exp":550,"skill":{"skillId":1099,"position":"s2","skillName":"魅影","skillDescription":"增加本方所有力量类型小鸟重量20%"},"baitName":"闪雷幼兽","baitField":"飞翔岛屿"},
    {"i":100,"name":"小迅雷兽","period":400,"ws":4500,"we":7500,"exp":600,"skill":{"skillId":1100,"position":"s1","skillName":"闪雷术","skillDescription":"增加自身重量40%,降低对手重量8%"},"baitName":"小潘狐猴","baitField":"惊厥草原"},
    {"i":101,"name":"小魅影兽","period":600,"ws":9000,"we":10000,"exp":1800,"skill":{"skillId":1101,"position":"s2","skillName":"魅惑术","skillDescription":"增加本方所有力量类型小鸟重量25%"},"baitName":"小闪雷兽","baitField":"惊厥草原"},
    {"i":102,"name":"迅雷王兽","period":400,"ws":15000,"we":25000,"exp":2000,"skill":{"skillId":1102,"position":"s1","skillName":"极雷之光","skillDescription":"增加自身重量60%,降低对手重量13%"},"baitName":"潘狐猴王","baitField":"梦想花园"},
    {"i":103,"name":"魅影王兽","period":600,"ws":35000,"we":50000,"exp":7777,"skill":{"skillId":1103,"position":"s2","skillName":"千面幻影","skillDescription":"增加本方所有力量类型小鸟重量35%"},"baitName":"闪雷王兽","baitField":"梦想花园"},
    {"i":104,"name":"幽灵鸟","period":44,"ws":2000,"we":4400,"exp":250,"skill":{"skillId":1104,"position":"s1","skillName":"幽灵幻象","skillDescription":"增加本方所有幻想类型小鸟重量25%"},"baitName":"南瓜糖","baitField":"彩虹树林"},
    {"i":105,"name":"圣诞麋鹿","period":1225,"ws":30000,"we":40000,"exp":8888,"skill":null,"baitName":"圣诞袜","baitField":"梦想花园"},
    {"i":106,"name":"史努比","period":50,"ws":4000,"we":8000,"exp":800,"skill":null,"baitName":"冰淇淋","baitField":"惊厥草原"},
    {"i":107,"name":"龙宝宝","period":888,"ws":800,"we":800,"exp":888,"skill":{"skillId":1107,"position":"s1","skillName":"恭喜发财","skillDescription":"最幸运的龙宝宝在天梯战斗胜利后经常为主人带来幸运的惊喜"},"baitName":"小龙珠","baitField":"彩虹树林"},
    {"i":108,"name":"白羊鸟","period":600,"ws":32100,"we":45000,"exp":3500,"skill":{"skillId":1108,"position":"s1","skillName":"水晶之墙","skillDescription":"死亡时给予对方当前白羊体重的伤害1～1.5倍，并降低对方全体克制100点"},"baitName":"白羊之星","baitField":"梦想花园"},
    {"i":109,"name":"金牛鸟","period":1200,"ws":32200,"we":49900,"exp":6500,"skill":{"skillId":1109,"position":"s1","skillName":"巨型号角","skillDescription":"减少所有敌人重量15%，克制值50%"},"baitName":"金牛之星","baitField":"梦想花园"},
    {"i":110,"name":"双子鸟","period":1000,"ws":40000,"we":48000,"exp":9000,"skill":{"skillId":1110,"position":"s3","skillName":"异次元空间","skillDescription":"降低对方重量提升自身重量，3转降低对方重量20％，增加自身重量20％"},"baitName":"双子之星","baitField":"梦想花园"},
    {"i":111,"name":"巨蟹鸟","period":800,"ws":40000,"we":55000,"exp":6500,"skill":{"skillId":1111,"position":"s3","skillName":"积尸转灵波","skillDescription":"作为转世轮回的主宰，巨蟹鸟可轻易的让对手失去转生的优势，使对位的小鸟回到0转百级时的重量（3转时发动"},"baitName":"巨蟹之星","baitField":"梦想花园"},
    {"i":112,"name":"泡泡鸟","period":10,"ws":1000,"we":1800,"exp":3000,"skill":null,"baitName":"泡泡","baitField":"彩虹树林"},
    {"i":113,"name":"狮子鸟","period":1200,"ws":35000,"we":59000,"exp":9000,"skill":{"skillId":1113,"position":"s2","skillName":"闪电光速拳","skillDescription":"增加自身重量25%，减少自身克制值100%"},"baitName":"狮子之星","baitField":"梦想花园"},
    {"i":114,"name":"处女鸟","period":1200,"ws":33000,"we":45000,"exp":4500,"skill":{"skillId":1114,"position":"s1","skillName":"天舞宝轮","skillDescription":"提高自身所装备笼子的增重效果，1/2/3转时提升100/200/300%"},"baitName":"处女之星","baitField":"梦想花园"},
    {"i":115,"name":"天秤鸟","period":1200,"ws":40000,"we":56000,"exp":7000,"skill":{"skillId":1115,"position":"s1","skillName":"末日审判","skillDescription":"末日中降临的对世间万物最后审判，一切无谓的反抗将遭到最无情的攻击，1转增重1.2倍，2转1.4倍增重，3转1.6倍增重。"},"baitName":"天秤之星","baitField":"梦想花园"},
    {"i":116,"name":"天蝎鸟","period":1200,"ws":30000,"we":44000,"exp":15000,"skill":{"skillId":1116,"position":"s1","skillName":"深红毒针","skillDescription":"每次对敌，发射5~15根毒针减少敌方重量，1/2/3转时每根减少1/3/5%"},"baitName":"天蝎之星","baitField":"梦想花园"},
    {"i":117,"name":"射手鸟","period":600,"ws":39000,"we":48000,"exp":8000,"skill":{"skillId":1117,"position":"s1","skillName":"黄金之箭","skillDescription":"战斗中的射手鸟瞄准对手的身后，若是对方没有及时击败射手鸟，黄金之箭将洞穿一切敌人。"},"baitName":"射手之星","baitField":"梦想花园"},
    {"i":118,"name":"摩羯鸟","period":800,"ws":34000,"we":44000,"exp":4500,"skill":{"skillId":1118,"position":"s1","skillName":"圣剑","skillDescription":"战斗的狂热将使得摩羯的圣剑愈发锋利，战胜一切挡在面前的一切敌人,3转满级第一场削弱对方15%，第二场削弱对方30%，第三场削弱对方50%"},"baitName":"摩羯之星","baitField":"梦想花园"},
    {"i":119,"name":"水瓶鸟","period":1000,"ws":33000,"we":43000,"exp":7000,"skill":{"skillId":1119,"position":"s1","skillName":null,"skillDescription":null},"baitName":"水瓶之星","baitField":"梦想花园"},
    {"i":120,"name":"双鱼鸟","period":1100,"ws":35000,"we":47000,"exp":4000,"skill":{"skillId":1120,"position":"s1","skillName":"吸血玫瑰","skillDescription":"对手每次的死亡将使得双鱼鸟的吸血玫瑰更加艳丽鲜红，这死亡之花将覆盖面前的所有生物，无一幸免"},"baitName":"双鱼之星","baitField":"梦想花园"},
    {"i":121,"name":"感恩火鸡","period":20,"ws":3300,"we":5500,"exp":600,"skill":null,"baitName":"感恩火鸡蛋","baitField":"飞翔岛屿"},
    {"i":122,"name":"啃塔鸡","period":60,"ws":5000,"we":10000,"exp":1000,"skill":{"skillId":1122,"position":"s1","skillName":"好穷！","skillDescription":"每次战斗结束后额外获得所获金币20%，至少100"},"baitName":"黄金爆米花","baitField":"彩虹树林"},
    {"i":123,"name":"麦热鸡","period":60,"ws":500,"we":1000,"exp":3000,"skill":{"skillId":1123,"position":"s2","skillName":"好饿！","skillDescription":"每次战斗结束后额外获得所获经验10%，至少1点"},"baitName":"经验汉堡","baitField":"彩虹树林"},
    {"i":124,"name":"金刚鹦鹉","period":1320,"ws":100,"we":800,"exp":8888,"skill":null,"baitName":"金刚石","baitField":"彩虹树林"},
    {"i":125,"name":"蛇宝宝","period":999,"ws":1000,"we":1800,"exp":3000,"skill":{"skillId":1125,"position":"s1","skillName":"红包拿来","skillDescription":"蛇宝宝在天梯战斗胜利后得到一定魅力值（1个到5个之间随机）"},"baitName":"蛇莓","baitField":"彩虹树林"},
    {"i":126,"name":"雅典娜","period":120,"ws":32000,"we":41000,"exp":9000,"skill":{"skillId":1126,"position":"s1","skillName":"女神之泪","skillDescription":"增加本方所有小鸟重量的30%，并且自身不会受到重量下降的效果"},"baitName":"女神圣衣","baitField":"梦想花园"},
    {"i":127,"name":"阿波罗","period":1000,"ws":31000,"we":39000,"exp":10000,"skill":{"skillId":1127,"position":"s1","skillName":"太阳战车","skillDescription":"阿波罗的专属座驾，当阿波罗压轴出场时就能被召唤出场。得到太阳战车加成的阿波罗将发挥数倍于平时的实力"},"baitName":"耀目之箭","baitField":"梦想花园"},
    {"i":128,"name":"普罗米修斯","period":270,"ws":35000,"we":45000,"exp":3000,"skill":{"skillId":1128,"position":"s1","skillName":"火之荣耀","skillDescription":"普罗米修斯出场后根据自己的转生次数会增加已方的所有战友的体重，1转增加3%，2转增加6%，3转增加10%。"},"baitName":"烈焰火纹","baitField":"梦想花园"},
    {"i":129,"name":"阿耳忒弥斯","period":1000,"ws":37000,"we":48000,"exp":12000,"skill":{"skillId":1129,"position":"s1","skillName":"月光","skillDescription":"当月神被克制的时候对方不增加体重，反而会增加阿耳忒弥斯的体重（对雅典娜无效）"},"baitName":"弯月陨石","baitField":"梦想花园"},
    {"i":130,"name":"阿芙洛狄忒","period":330,"ws":34000,"we":43000,"exp":4500,"skill":{"skillId":1130,"position":"s1","skillName":"爱语呢喃","skillDescription":"爱神与异性作战时会增加自己（0转无效，1转20%,2转40%，3转60%）的体重（增益特效会保留）"},"baitName":"同心手镯","baitField":"梦想花园"},
    {"i":131,"name":"阿瑞斯","period":1000,"ws":75000,"we":90000,"exp":15000,"skill":{"skillId":1131,"position":"s1","skillName":"战神","skillDescription":"无具体作用"},"baitName":"战神铠甲","baitField":"梦想花园"},
    {"i":132,"name":"波塞冬","period":420,"ws":34000,"we":70000,"exp":7000,"skill":{"skillId":1132,"position":"s1","skillName":"狂暴海啸","skillDescription":"波塞冬释放的十二级狂暴大海啸，能攻击对方群体"},"baitName":"玄冰三叉戟","baitField":"梦想花园"},
    {"i":133,"name":"哈迪斯","period":360,"ws":45000,"we":58000,"exp":6500,"skill":{"skillId":1133,"position":"s1","skillName":"冥皇咆哮","skillDescription":"失败后的哈迪斯将轮回的力量转加于下一只小鸟身上"},"baitName":"冥狱权杖","baitField":"梦想花园"},
    {"i":134,"name":"赫拉","period":1800,"ws":41000,"we":65000,"exp":18000,"skill":{"skillId":1134,"position":"s1","skillName":"神后之妒","skillDescription":"善妒的赫拉极度嫉妒他人变异与天赋，遇到对方的变异和天赋会增重，每遇到一个增加一定百分比，一转10%，二转20%，三转30%，举例三转赫拉遇到一个三变异和拥有天赋的鸟体重增加120%，仅生效一次"},"baitName":"众神后冠","baitField":"梦想花园"},
    {"i":135,"name":"洛基","period":1200,"ws":40000,"we":54000,"exp":8000,"skill":{"skillId":1135,"position":"s1","skillName":"命运之骰","skillDescription":"顽劣的洛基总爱和他人炫耀他的智慧和神骰，博弈就是洛基战斗的开始"},"baitName":"邪神珀骰","baitField":"梦想花园"},
    {"i":136,"name":"马宝宝","period":120,"ws":1200,"we":2400,"exp":1999,"skill":{"skillId":1136,"position":"s1","skillName":"天马散花","skillDescription":"马宝宝天生对鲜花有着独特的敏感，即时在黑夜中也能准确定位鲜花所在,战斗胜利后获得鲜花"},"baitName":"吉祥甘草","baitField":"飞翔岛屿"},
    {"i":137,"name":"奥丁","period":1400,"ws":42000,"we":68000,"exp":8500,"skill":{"skillId":1137,"position":"s1","skillName":"魔法之光","skillDescription":"身为北欧神主的奥丁，拥有至高的神力和魔法，一旦和奥丁盟誓，共同进退，就能分享奥丁无上的魔法"},"baitName":"永恒之枪","baitField":"梦想花园"},
    {"i":138,"name":"宙斯","period":1800,"ws":65000,"we":85000,"exp":12000,"skill":{"skillId":1138,"position":"s1","skillName":"众神之怒","skillDescription":"神王的怒火就是众神的怒火，在神王的怒吼之下，万物皆归尘土"},"baitName":"诸神雷霆","baitField":"梦想花园"},
    {"i":139,"name":"光头强","period":100,"ws":1000,"we":2000,"exp":5000,"skill":{"skillId":1139,"position":"s3","skillName":"揍你没商量","skillDescription":"揍你没商量,每次触发扣除50爱心增加100斤总重量，爱心不足无法触发（下局生效），重量跟随天梯重置"},"baitName":"小电锯","baitField":"惊厥草原"},
    {"i":140,"name":"基德","period":600,"ws":8000,"we":12000,"exp":3000,"skill":{"skillId":1140,"position":"s1","skillName":"怪盗的微笑","skillDescription":"当基德发出他招牌的微笑，预示下一个受害者即将出现，每次战斗中都有一定几率和对方交换体重，并且交战双方的小鸟会以交换后的体重继续战斗"},"baitName":"小丑蛋","baitField":"惊厥草原"},
    {"i":153,"name":"彩虹鸟","period":5,"ws":480,"we":600,"exp":3000,"skill":{"skillId":1153,"position":"s2","skillName":"彩虹之光","skillDescription":"增加本方所有小鸟重量10%，克制值10%"},"baitName":"彩虹糖果","baitField":"彩虹树林"},
    {"i":154,"name":"飞翼鸟","period":10,"ws":2000,"we":2500,"exp":3000,"skill":{"skillId":1154,"position":"s2","skillName":"纯白气息","skillDescription":"增加本方所有小鸟重量13%，克制值20%"},"baitName":"纯白羽翼","baitField":"飞翔岛屿"},
    {"i":155,"name":"惊厥雷鸟","period":300,"ws":7200,"we":9000,"exp":4000,"skill":{"skillId":1155,"position":"s2","skillName":"狂雷","skillDescription":"增加本方所有小鸟重量16%，克制值30%"},"baitName":"雷光幼兔","baitField":"惊厥草原"},
    {"i":156,"name":"时光鸟","period":30,"ws":9600,"we":12000,"exp":5000,"skill":{"skillId":1156,"position":"s2","skillName":"时光扭曲","skillDescription":"增加本方所有小鸟重量20%，克制值40%"},"baitName":"时光草","baitField":"时光洞穴"},
    {"i":157,"name":"麒麟","period":500,"ws":22000,"we":30000,"exp":8888,"skill":{"skillId":1157,"position":"s3","skillName":"幻之祥瑞","skillDescription":"麒麟可召唤天界祥云的祝福，额外增加己方幻想型的小鸟的重量"},"baitName":"灵之祥云","baitField":"梦想花园"},
    {"i":158,"name":"年兽","period":300,"ws":15800,"we":23800,"exp":2025,"skill":{"skillId":1158,"position":"s3","skillName":"噼里啪啦","skillDescription":"战斗胜利，年兽发动技能有机会获得小爆竹（12%几率发动）"},"baitName":"喜庆年糕","baitField":"时光洞穴"},
    {"i":159,"name":"羊宝宝","period":500,"ws":40000,"we":50000,"exp":8888,"skill":{"skillId":1159,"position":"s2","skillName":"好运相伴","skillDescription":"自己阵容中魔法型小鸟重量提升40%"},"baitName":"幸运春草","baitField":"梦想花园"},
    {"i":160,"name":"青怪鸟","period":999999999,"ws":46000,"we":48000,"exp":999999999,"skill":{"skillId":1160,"position":"s1","skillName":"闻歌狂舞","skillDescription":"自身重量提升25%×转生次数（50%几率发动）"},"baitName":"风笛","baitField":"梦想花园"},
    {"i":161,"name":"毒怪鸟","period":999999999,"ws":26000,"we":35000,"exp":999999999,"skill":{"skillId":1161,"position":"s2","skillName":"闪光","skillDescription":"敌方所有小鸟克制下降50%×转生次数（75%几率发动）"},"baitName":"毒液","baitField":"梦想花园"},
    {"i":162,"name":"吸血蝠","period":480,"ws":4000,"we":6000,"exp":1000,"skill":{"skillId":1162,"position":"s2","skillName":"血宴","skillDescription":"战斗前吸取对方5%×转生次数 的重量到自身（50%几率发动）"},"baitName":"龙血","baitField":"时光洞穴"},
    {"i":163,"name":"炽天使","period":600,"ws":40000,"we":48500,"exp":7900,"skill":{"skillId":1163,"position":"s1","skillName":"撒拉弗之怒","skillDescription":"减少所有敌人重量20%"},"baitName":"燃炎之剑","baitField":"彩虹树林"},
    {"i":164,"name":"忍鸟","period":180,"ws":16000,"we":22000,"exp":4000,"skill":{"skillId":1164,"position":"s1","skillName":"精神一统","skillDescription":"增加自身重量55%"},"baitName":"漆黑苦无","baitField":"彩虹树林"},
    {"i":165,"name":"眠鸟","period":600,"ws":39000,"we":50000,"exp":7500,"skill":{"skillId":1165,"position":"s1","skillName":"爆眠弹","skillDescription":"增加本方所有小鸟重量20%，克制值30%"},"baitName":"催眠草","baitField":"时光洞穴"},
    {"i":169,"name":"圣诞乔巴","period":200,"ws":4000,"we":5000,"exp":500,"skill":{"skillId":1169,"position":"s1","skillName":"樱吹雪","skillDescription":"增加本方所有小鸟重量8%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":170,"name":"智慧乔巴","period":200,"ws":10000,"we":11000,"exp":800,"skill":{"skillId":1170,"position":"s1","skillName":"樱吹雪·华","skillDescription":"增加本方所有小鸟重量10%，克制值15%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":171,"name":"毛球乔巴","period":200,"ws":21000,"we":22000,"exp":1500,"skill":{"skillId":1171,"position":"s1","skillName":"樱吹雪·散","skillDescription":"增加本方所有小鸟重量14%，克制值30%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":172,"name":"跳跃乔巴","period":200,"ws":32000,"we":33000,"exp":2500,"skill":{"skillId":1172,"position":"s1","skillName":"樱吹雪·霞","skillDescription":"增加本方所有小鸟重量18%，克制值45%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":173,"name":"究极乔巴","period":200,"ws":46000,"we":47000,"exp":4000,"skill":{"skillId":1173,"position":"s1","skillName":"刻啼樱吹雪","skillDescription":"增加本方所有小鸟重量25%，克制值60%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":174,"name":"梦幻乔巴","period":200,"ws":52000,"we":53000,"exp":4000,"skill":{"skillId":1174,"position":"s1","skillName":"樱吹雪散华","skillDescription":"增加本方所有小鸟重量32%，克制值75%"},"baitName":"海贼便当","baitField":"彩虹树林"},
    {"i":175,"name":"银火龙","period":300,"ws":34000,"we":35000,"exp":9000,"skill":{"skillId":1175,"position":"s1","skillName":"龙之咆哮","skillDescription":"增加自身重量180%"},"baitName":"火龙的红玉","baitField":"梦想花园"},
    {"i":176,"name":"炎王龙","period":1,"ws":1,"we":2,"exp":1,"skill":{"skillId":1176,"position":"s1","skillName":"烈焰爆破","skillDescription":"自身重量上升 转生次数*35%"},"baitName":"炎之粉尘","baitField":"时光洞穴"},
    {"i":177,"name":"迅龙","period":1,"ws":1,"we":2,"exp":1,"skill":{"skillId":1177,"position":"s2","skillName":"暗影之击","skillDescription":"增加本方所有敏捷类型小鸟重量40%"},"baitName":"漆黑之刃","baitField":"惊厥草原"},
    {"i":178,"name":"冰凤凰","period":100,"ws":300,"we":800,"exp":200,"skill":{"skillId":1178,"position":"s1","skillName":"雪之华","skillDescription":"增加自身重量20斤，克制值15%"},"baitName":"冰之花","baitField":"彩虹树林"},
    {"i":179,"name":"年魅","period":666,"ws":53000,"we":56000,"exp":8500,"skill":{"skillId":1179,"position":"s2","skillName":"新年之光","skillDescription":"减少对手重量90%，增加自身重量10%"},"baitName":"七彩圆子","baitField":"时光洞穴"},
    {"i":185,"name":"猴宝宝","period":600,"ws":45000,"we":57000,"exp":8500,"skill":{"skillId":1185,"position":"s2","skillName":"七十二变","skillDescription":"增加本方所有小鸟重量30%，克制值50%"},"baitName":"奇异香蕉","baitField":"梦想花园"},
    {"i":186,"name":"太白鸟","period":850,"ws":13000,"we":51000,"exp":7500,"skill":{"skillId":1186,"position":"s1","skillName":"斗转星移","skillDescription":"增加本方所有力量类型小鸟重量22%"},"baitName":"金丹","baitField":"云颠仙境"},
    {"i":187,"name":"紫霞鸟","period":400,"ws":25000,"we":48000,"exp":4000,"skill":{"skillId":1187,"position":"s2","skillName":"佛光普照","skillDescription":"增加本方所有小鸟重量10%，克制值40%"},"baitName":"蟠桃","baitField":"云颠仙境"},
    {"i":188,"name":"酒仙鸟","period":900,"ws":12000,"we":33000,"exp":9300,"skill":{"skillId":1188,"position":"s1","skillName":"醉拳","skillDescription":"减少所有敌人克制值60%"},"baitName":"玉露琼浆","baitField":"云颠仙境"},
    {"i":189,"name":"雷雀","period":55,"ws":3000,"we":3500,"exp":75,"skill":{"skillId":1189,"position":"s2","skillName":"飞雷针","skillDescription":"减少对手重量20%"},"baitName":"玉露琼浆","baitField":"云颠仙境"},
    {"i":190,"name":"绮罗鸟","period":35,"ws":2300,"we":4300,"exp":300,"skill":{"skillId":1190,"position":"s1","skillName":"绫罗飞舞","skillDescription":"减少所有敌人重量13%"},"baitName":"仙丹","baitField":"云颠仙境"},
    {"i":191,"name":"爱恋鸟","period":30,"ws":1000,"we":2500,"exp":200,"skill":{"skillId":1191,"position":"s3","skillName":"比翼","skillDescription":"增加自身重量45%"},"baitName":"瑶池圣水","baitField":"云颠仙境"},
    {"i":192,"name":"暗炎凤凰","period":1300,"ws":17500,"we":53000,"exp":10000,"skill":{"skillId":1192,"position":"s2","skillName":"黑死炎","skillDescription":"减少对手重量40%，增加自身重量10%(50%触发)"},"baitName":"黑炎草","baitField":"云颠仙境"},
    {"i":193,"name":"微火兽","period":233,"ws":5000,"we":8800,"exp":520,"skill":{"skillId":1193,"position":"s3","skillName":"炎阳索","skillDescription":"提高自身克制值85%"},"baitName":"云之结晶","baitField":"云颠仙境"},
    {"i":194,"name":"锁链鸟","period":420,"ws":10000,"we":30000,"exp":5300,"skill":{"skillId":1194,"position":"s2","skillName":"飞链","skillDescription":"个人竞技场中，增加本方所有小鸟重量15%"},"baitName":"云之结晶","baitField":"云颠仙境"},
    {"i":195,"name":"黄昏鸟","period":150,"ws":10000,"we":20000,"exp":1200,"skill":{"skillId":1195,"position":"s3","skillName":"黄昏梦境","skillDescription":"个人竞技场中，增加本方所有小鸟重量25%"},"baitName":"冰心莲蓉","baitField":"云颠仙境"},
    {"i":196,"name":"霜鹏","period":500,"ws":13000,"we":39000,"exp":5300,"skill":{"skillId":1196,"position":"s1","skillName":"冰霜打击","skillDescription":"减少对手重量35%"},"baitName":"冰心莲蓉","baitField":"云颠仙境"},
    {"i":197,"name":"穿云雕","period":640,"ws":23000,"we":39500,"exp":7000,"skill":{"skillId":1197,"position":"s2","skillName":"穿云击","skillDescription":"增加自身重量15%，克制值30%"},"baitName":"圣果","baitField":"云颠仙境"},
    {"i":198,"name":"鬼鸟","period":70,"ws":2500,"we":7000,"exp":550,"skill":{"skillId":1198,"position":"s1","skillName":"灵体","skillDescription":"自身重量上升转生次数*15%"},"baitName":"圣果","baitField":"云颠仙境"},
    {"i":199,"name":"追日鸟","period":280,"ws":16000,"we":26000,"exp":1900,"skill":{"skillId":1199,"position":"s1","skillName":"日灸","skillDescription":"减少对手重量10%，增加自身重量25%"},"baitName":"仙丹","baitField":"云颠仙境"},
    {"i":202,"name":"幼年雪凤","period":200,"ws":6000,"we":8000,"exp":500,"skill":{"skillId":1202,"position":"s1","skillName":"冰舞","skillDescription":"减少所有敌人重量10%，增加自身克制值10%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":203,"name":"吹雪幼凤","period":200,"ws":12000,"we":14000,"exp":800,"skill":{"skillId":1203,"position":"s1","skillName":"冰舞·吹雪","skillDescription":"减少所有敌人重量13%，增加自身克制值18%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":204,"name":"小雪凤凰","period":200,"ws":21000,"we":22000,"exp":1500,"skill":{"skillId":1204,"position":"s1","skillName":"冰舞·结晶","skillDescription":"减少所有敌人重量16%，增加自身克制值26%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":205,"name":"冰晶凤凰","period":200,"ws":34000,"we":35000,"exp":2500,"skill":{"skillId":1205,"position":"s1","skillName":"冰舞·冻结","skillDescription":"减少所有敌人重量19%，增加自身克制值35%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":206,"name":"极寒雪凤","period":200,"ws":49000,"we":49500,"exp":4000,"skill":{"skillId":1206,"position":"s1","skillName":"冰舞·极寒","skillDescription":"减少所有敌人重量22%，增加自身克制值45%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":207,"name":"冰雪凤王","period":200,"ws":57000,"we":58000,"exp":6000,"skill":{"skillId":1207,"position":"s1","skillName":"冰舞·地狱","skillDescription":"减少所有敌人重量30%，增加自身克制值60%"},"baitName":"冰之花","baitField":"飞翔岛屿"},
    {"i":208,"name":"鸡宝宝","period":340,"ws":35000,"we":60000,"exp":7777,"skill":{"skillId":1208,"position":"s2","skillName":"烈焰之羽","skillDescription":"增加本方所有小鸟重量35%"},"baitName":"银色麦穗","baitField":"梦想花园"},
    {"i":209,"name":"狗宝宝","period":400,"ws":50000,"we":61000,"exp":7200,"skill":{"skillId":1209,"position":"s3","skillName":"天狗食月","skillDescription":"(40%，30%，20%，10%)几率增加本方所有小鸟相应(20%,30%,40%,50%)重量"},"baitName":"肉包子","baitField":"梦想花园"},
    {"i":210,"name":"九尾妖狐","period":200,"ws":51000,"we":52000,"exp":6000,"skill":{"skillId":1210,"position":"s2","skillName":"魅惑","skillDescription":"开场前30%概率，让对方的鸟互相攻击一次"},"baitName":"绣花鞋","baitField":"飞翔岛屿"},
    {"i":211,"name":"佩佩猪","period":200,"ws":65000,"we":75000,"exp":7500,"skill":{"skillId":1211,"position":"s2","skillName":"好吃懒做","skillDescription":"对手看见瞌睡虫就想睡觉,困的不成了,再让我躺一会!"},"baitName":"愤怒小鸟","baitField":"梦想花园"},
    {"i":212,"name":"西索","period":200,"ws":50000,"we":52000,"exp":7100,"skill":{"skillId":1212,"position":"s3","skillName":"混沌","skillDescription":"开局前30%概率让所有鸟技能随机。"},"baitName":"幸运色子","baitField":"梦想花园"},
    {"i":213,"name":"鼠宝宝","period":200,"ws":60000,"we":63000,"exp":7000,"skill":{"skillId":1213,"position":"s1","skillName":"偷天换日","skillDescription":"技能生效时获取对方任一一只相应位置技能"},"baitName":"油壶","baitField":"梦想花园"},
    {"i":214,"name":"鹤鸵","period":600,"ws":4500,"we":5000,"exp":1800,"skill":{"skillId":1214,"position":"s1","skillName":"嗜血","skillDescription":"杀不死它的终究使它更加强大。在嗜血的加持下，鹤鸵有几率不受对位小鸟技能(神恩、神圣、狂暴加成)伤害加成。(一转触发概率25%,二转触发概率50%,三转触发概率75%。)"},"baitName":"炭火堆","baitField":"飞翔岛屿"},
    {"i":215,"name":"蠃鱼","period":1200,"ws":15800,"we":65000,"exp":15000,"skill":{"skillId":1215,"position":"s1","skillName":"洪流急促","skillDescription":"第一场上场时100%概率免疫对方天赋，并增重10%第二场上场时70％概率免疫对方天赋，并增重30% \n第三场上场时40％概率免疫对方天赋，并增重60%(每场体重加成不保留)"},"baitName":"梦珠","baitField":"云颠仙境"},
    {"i":216,"name":"狰","period":600,"ws":8000,"we":9000,"exp":2200,"skill":{"skillId":1216,"position":"s3","skillName":"血月","skillDescription":"借助月的光辉无惧任何力量，被克制受血月影响，对方不增重，反而增加狰的体重,根据狰的克制增加（根据自己克制增加体重，公式为克制*0.8*初重，体重不保留）"},"baitName":"幼虎","baitField":"惊厥草原"},
    {"i":217,"name":"蛊雕","period":680,"ws":20000,"we":26000,"exp":6500,"skill":{"skillId":1217,"position":"s3","skillName":"啼哭","skillDescription":"敌方受到啼哭的惊扰，一瞬间慌了神，敌人进入惊慌状态（固定类天赋增益减少一半），降低敌方群体克制一半（最多不超过3只）。"},"baitName":"龙肉","baitField":"时光洞穴"},
    {"i":218,"name":"金乌","period":2000,"ws":14800,"we":45000,"exp":20000,"skill":{"skillId":1218,"position":"s3","skillName":"烈日灼心","skillDescription":"开局掷色子，掷色子到小(1,2,3),减少对方所有小鸟重量30％，阳光普照-开局掷色子到大(4，5，6)，增加本方所有小鸟重量30%"},"baitName":"扶桑叶","baitField":"云颠仙境"},
    {"i":219,"name":"鲲鹏","period":1500,"ws":18000,"we":68000,"exp":35000,"skill":{"skillId":1219,"position":"s3","skillName":"遮天蔽日","skillDescription":"鲲鹏拥有强大的法宝《洛书》，蕴含着天地间的奥秘和强大力量，在三号位上场时发动，免疫对方天赋并增加自身2倍的重量"},"baitName":"洛书","baitField":"云颠仙境"},
    {"i":220,"name":"帝江","period":2000,"ws":20100,"we":52000,"exp":25000,"skill":{"skillId":1220,"position":"s3","skillName":"混沌领域","skillDescription":"展开混沌能量场，使己方全体进入「混沌庇护」状态，免疫所有负面状态（100%几率发动）；且失败下场后将增加本方所有敏捷小鸟40%重量（70%几率发动），多只帝江同时上场仅一只技能生效。"},"baitName":"混沌珠","baitField":"云颠仙境"},
    {"i":221,"name":"乌鸫","period":1000,"ws":1000,"we":2500,"exp":5000,"skill":{"skillId":1221,"position":"s3","skillName":"纯净歌声","skillDescription":"内心纯洁的乌鸫受到友方的天赋增重效果增加百分之五十，仅生效战斗前的效果。（60%触发）"},"baitName":"金龟子","baitField":"彩虹树林"},
    {"i":222,"name":"鴖","period":800,"ws":5000,"we":6000,"exp":6000,"skill":{"skillId":1222,"position":"s3","skillName":"控火术","skillDescription":"运用御火之能，给己方全体添加自身体重30%的火之护盾（80%几率发动）。"},"baitName":"火灵珠","baitField":"飞翔岛屿"},
    {"i":223,"name":"大风","period":1500,"ws":24800,"we":30000,"exp":8000,"skill":{"skillId":1223,"position":"s3","skillName":"狂风卷地","skillDescription":"以自身为中心展开法阵，召唤强烈旋风，将全部敌人乱入其中，敌人行动受阻，减少敌方全体小鸟10％的重量（60%几率发动），同时自身在旋风中占据主导地位，增加自身克制×0.1的重量，重量不保留"},"baitName":"定风珠","baitField":"时光洞穴"},
    {"i":224,"name":"浴火凤凰","period":3000,"ws":45000,"we":80000,"exp":40000,"skill":{"skillId":1224,"position":"s3","skillName":"涅槃重生","skillDescription":"与对方小鸟对战失败后，给对方小鸟附加灼烧状态（灼烧状态每回合减少10%体重，无视免疫），触发涅槃重生天赋，立刻复活，免疫对方天赋并且自身重量增加50%。（仅一只生效）"},"baitName":"神火","baitField":"云颠仙境"},
    {"i":225,"name":"鬼鸮","period":1000,"ws":1000,"we":2500,"exp":5000,"skill":{"skillId":1225,"position":"s3","skillName":"夜影猎杀","skillDescription":"增加自身重量15%，克制值30%"},"baitName":"冥鼠","baitField":"彩虹树林"},
    {"i":226,"name":"肥遗","period":800,"ws":5500,"we":6800,"exp":6500,"skill":{"skillId":1226,"position":"s3","skillName":"厚积薄发","skillDescription":"压轴出场积蓄力量，队友的每一次对战都能为肥遗提供20%的重量加成。"},"baitName":"九阳燧木","baitField":"飞翔岛屿"},
    {"i":227,"name":"睚眦","period":999,"ws":9900,"we":14900,"exp":9999,"skill":{"skillId":1227,"position":"s3","skillName":"以牙还牙","skillDescription":"当睚眦受到伤害后会进行反击，减少对方下一只小鸟一定比例的重量（第一次20%，第二次40%，最多两次）。"},"baitName":"龙血玄铁","baitField":"惊厥草原"},
    {"i":228,"name":"飞廉","period":600,"ws":12000,"we":15000,"exp":6000,"skill":{"skillId":1228,"position":"s3","skillName":"呼风唤雨","skillDescription":"增加本方所有敏捷类型小鸟重量25%，克制值增加50%（60%几率触发）"},"baitName":"风息琥珀","baitField":"时光洞穴"},
    {"i":229,"name":"功夫熊猫","period":500,"ws":1200,"we":1800,"exp":5000,"skill":{"skillId":1229,"position":"s3","skillName":"无招胜有招","skillDescription":"战斗胜利后，能为已方带来50%的经验加成（三转时发动）"},"baitName":"翡翠面条","baitField":"彩虹树林"},
    {"i":230,"name":"兔宝宝","period":500,"ws":1200,"we":1800,"exp":5000,"skill":{"skillId":1230,"position":"s3","skillName":"天官赐福","skillDescription":"兔宝宝为全队祈福，技能释放概率提升 5%(最高90%    )，福运连连！"},"baitName":"桂香月饼","baitField":"梦想花园"},
    {"i":231,"name":"虎宝宝","period":800,"ws":48000,"we":58800,"exp":15000,"skill":{"skillId":1231,"position":"s3","skillName":"虎虎生威","skillDescription":"增加本方所有虎宝宝的重量 35%"},"baitName":"雾谷虎骨哨","baitField":"梦想花园"},
    {"i":232,"name":"句芒","period":2000,"ws":42000,"we":66000,"exp":30000,"skill":{"skillId":1232,"position":"s3","skillName":"神木庇佑","skillDescription":"技能发动时，为己方当前重量最大的伙伴降下「神木庇佑」：重量提升 50%（仅生效一次）。"},"baitName":"神木","baitField":"云颠仙境"},
    {"i":233,"name":"佛法僧","period":500,"ws":800,"we":1200,"exp":3500,"skill":{"skillId":1233,"position":"s3","skillName":"彩羽禅音","skillDescription":"释放技能，使全体小鸟获得增幅：增加本方所有小鸟重量15%，克制15%"},"baitName":"鱼虫","baitField":"彩虹树林"},
    {"i":234,"name":"北极鸥","period":500,"ws":4000,"we":5000,"exp":3500,"skill":{"skillId":1234,"position":"s3","skillName":"信仰极光","skillDescription":"队友在北极鸥极光之下，增加本方所有小鸟重量18%，克制值增加25%"},"baitName":"冰晶","baitField":"飞翔岛屿"},
    {"i":235,"name":"黑白兀鹫","period":1000,"ws":12800,"we":18000,"exp":3000,"skill":null,"baitName":"生肉","baitField":"云颠仙境"},
    {"i":236,"name":"蓑羽鹤","period":800,"ws":400,"we":1200,"exp":450,"skill":null,"baitName":"罗非鱼","baitField":"云颠仙境"},
    {"i":237,"name":"东方白鹳","period":900,"ws":30000,"we":45000,"exp":4500,"skill":null,"baitName":"罗非鱼","baitField":"云颠仙境"},
    {"i":238,"name":"红腹锦鸡","period":1000,"ws":3000,"we":12000,"exp":1000,"skill":null,"baitName":"草果","baitField":"云颠仙境"},
    {"i":239,"name":"赑屃","period":600,"ws":5500,"we":7200,"exp":7000,"skill":{"skillId":1239,"position":"s3","skillName":"重力领域","skillDescription":"对位小鸟被拉进重量领域，对位小鸟重量减少50%"},"baitName":"石碑残片","baitField":"惊厥草原"},
    {"i":240,"name":"穷奇","period":1600,"ws":25500,"we":33000,"exp":9000,"skill":{"skillId":1240,"position":"s3","skillName":"逆乱之威","skillDescription":"登场时引发逆乱之气，自身重量激增50%（65%概率触发）。"},"baitName":"逆乱核心","baitField":"时光洞穴"},
    {"i":241,"name":"孔宣","period":3000,"ws":65000,"we":90000,"exp":50000,"skill":{"skillId":1241,"position":"s3","skillName":"五色神光","skillDescription":"轮到自己时触发，构建绝对防御：免疫所有负面技能；洞察破妄：识破并阻止敌方增重自身效果。仅一只生效"},"baitName":"五色翎羽","baitField":"云颠仙境"},
    {"i":242,"name":"山魈","period":1500,"ws":30000,"we":50000,"exp":20000,"skill":null,"baitName":"钱袋子","baitField":"云颠仙境"},
    {"i":243,"name":"猰貐","period":1300,"ws":25000,"we":45000,"exp":20000,"skill":null,"baitName":"钱袋子","baitField":"云颠仙境"},
    {"i":244,"name":"枫鬼","period":1600,"ws":70000,"we":80000,"exp":20000,"skill":null,"baitName":"钱袋子","baitField":"云颠仙境"},
    {"i":245,"name":"木客鸟","period":1800,"ws":100,"we":500,"exp":30000,"skill":null,"baitName":"生肉","baitField":"云颠仙境"},
    {"i":246,"name":"獬豸","period":1500,"ws":65000,"we":85000,"exp":30000,"skill":null,"baitName":"生肉","baitField":"云颠仙境"},
    {"i":248,"name":"戴胜","period":1000,"ws":1800,"we":2800,"exp":5500,"skill":{"skillId":1248,"position":"s3","skillName":"夜曲迷音","skillDescription":"个人竞技场中，戴胜释放音波，使己方戴胜重量提升10%（60%触发）。"},"baitName":"金针虫","baitField":"彩虹树林"},
    {"i":249,"name":"栎鸟","period":1000,"ws":6000,"we":7500,"exp":7000,"skill":{"skillId":1249,"position":"s3","skillName":"迅捷之影","skillDescription":"根据克制值减少对位小鸟重量（克制*0.05）（60%触发）。"},"baitName":"林影翅片","baitField":"飞翔岛屿"},
    {"i":250,"name":"囚牛","period":800,"ws":8500,"we":10000,"exp":7500,"skill":{"skillId":1250,"position":"s3","skillName":"乐韵共鸣","skillDescription":"登场时释放悠扬乐声，使己方全体小鸟重量增加22%，克制值增加35%"},"baitName":"古音琴木","baitField":"惊厥草原"},
    {"i":251,"name":"屏翳","period":700,"ws":12500,"we":16000,"exp":6500,"skill":{"skillId":1251,"position":"s3","skillName":"行云布雨","skillDescription":"召唤细雨，使己方全体敏捷小鸟重量增加26%，克制值增加60%（60%触发）；若与风伯（带种族技能）同时出场，额外触发“天降甘霖”：全体小鸟重量再+10%（100%触发）。"},"baitName":"云雨灵珠","baitField":"时光洞穴"},
    {"i":252,"name":"九色鹿","period":1500,"ws":52000,"we":62800,"exp":25000,"skill":{"skillId":1252,"position":"s3","skillName":"欢林梦语","skillDescription":"九色鹿周身散发着祥和的光芒，在战斗开始时，释放技能“欢愉”，为己方全体魔法小鸟增加38%的重量（66%触发），失败下场时，释放技能“祝祷”，为己方全体小鸟增加3%的重量（100%触发）。"},"baitName":"灵枝","baitField":"云颠仙境"},
    {"i":253,"name":"金色林鸲","period":600,"ws":1000,"we":1600,"exp":4000,"skill":{"skillId":1253,"position":"s3","skillName":"鸣春之歌","skillDescription":"通过悦耳歌声唤醒大地生机，增加己方所有魔法类型小鸟重量18%，克制20%（65%几率发动）。"},"baitName":"浆果","baitField":"彩虹树林"},
    {"i":254,"name":"帝企鹅","period":800,"ws":5000,"we":6600,"exp":6500,"skill":{"skillId":1254,"position":"s3","skillName":"冰霜守护","skillDescription":"召唤冰霜护盾，为己方全体小鸟提供相当于自身体重38%的额外防护（70%触发）。仅一只生效"},"baitName":"磷虾球","baitField":"飞翔岛屿"},
    {"i":255,"name":"白泽","period":1000,"ws":12000,"we":18000,"exp":10000,"skill":{"skillId":1255,"position":"s3","skillName":"万象归宗","skillDescription":"被对位克制时，白泽获得“万象归一”状态：对方不增重，自身提升重量（克制值×0.15）（100%触发）。仅触发一次"},"baitName":"万智玉简","baitField":"惊厥草原"},
    {"i":256,"name":"英招","period":1500,"ws":26000,"we":40000,"exp":15000,"skill":{"skillId":1256,"position":"s3","skillName":"天穹疾驰","skillDescription":"战斗中展翅高飞，自身进入「天穹加速」状态：受到友方的敏捷类技能增重效果增加100%。仅触发一次"},"baitName":"天穹翼羽","baitField":"时光洞穴"},
    {"i":257,"name":"白龙马","period":3000,"ws":68000,"we":95000,"exp":55555,"skill":{"skillId":1257,"position":"s3","skillName":"龙魂觉醒","skillDescription":"退场时触发“龙魂庇护”，对方无法免疫，获得自身重量100%护盾，仅一只生效，仅触发一次"},"baitName":"龙魂玉辔","baitField":"云颠仙境"},
    {"i":258,"name":"白鹇","period":666,"ws":666,"we":666,"exp":666,"skill":null,"baitName":"福果","baitField":"彩虹树林"}
];

let filteredBirds = [];
let sortColumn = null;
let sortDirection = 'asc';

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    filteredBirds = birdsData;
    renderBirdTable();
    
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterBirds(e.target.value);
    });
});

// 筛选小鸟
// 筛选小鸟
function filterBirds(searchText) {
    const text = searchText.toLowerCase().trim();
    console.log('搜索文本:', text);
    
    if (!text) {
        filteredBirds = birdsData;
        console.log('搜索为空，显示全部:', filteredBirds.length);
    } else {
        filteredBirds = birdsData.filter(bird => {
            // 只搜索文本字段
            const textFields = [
                bird.name || '',
                bird.baitName || '',
                bird.baitField || '',
                bird.skill ? (bird.skill.skillName || '') : '',
                bird.skill ? (bird.skill.skillDescription || '') : '',
                bird.skill ? (bird.skill.position || '') : ''
            ];
            
            // 如果搜索内容是纯数字，也搜索数值字段
            const isNumericSearch = /^\d+$/.test(text);
            if (isNumericSearch) {
                textFields.push(
                    bird.i.toString(),
                    bird.period.toString(),
                    bird.ws.toString(),
                    bird.we.toString(),
                    bird.exp.toString(),
                    bird.skill ? (bird.skill.skillId ? bird.skill.skillId.toString() : '') : ''
                );
            }
            
            const matched = textFields.some(field => 
                field && field.toLowerCase().includes(text)
            );
            
            if (matched) {
                console.log('匹配到:', bird.name, bird.i);
            }
            
            return matched;
        });
        console.log('过滤后结果数量:', filteredBirds.length);
    }
    
    renderBirdTable();
}

// 排序表格
function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    filteredBirds.sort((a, b) => {
        let aVal, bVal;
        
        // 处理特殊列
        if (column === 'maxLimit') {
            aVal = a.we * 5.8;
            bVal = b.we * 5.8;
        } else if (column === 'skillId') {
            aVal = a.skill ? a.skill.skillId : null;
            bVal = b.skill ? b.skill.skillId : null;
        } else if (column === 'skillPosition') {
            aVal = a.skill ? a.skill.position : null;
            bVal = b.skill ? b.skill.position : null;
        } else if (column === 'skillName') {
            aVal = a.skill ? a.skill.skillName : null;
            bVal = b.skill ? b.skill.skillName : null;
        } else if (column === 'skillDescription') {
            aVal = a.skill ? a.skill.skillDescription : null;
            bVal = b.skill ? b.skill.skillDescription : null;
        } else {
            aVal = a[column];
            bVal = b[column];
        }
        
        // 处理 null 值
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // 数字比较
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // 字符串比较
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    renderBirdTable();
}

// 渲染小鸟表格
function renderBirdTable() {
    const tbody = document.getElementById('birdTableBody');
    
    if (filteredBirds.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="loading">没有找到匹配的小鸟</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredBirds.map(bird => {
        const minWeight = (bird.ws / 100).toFixed(2);
        const maxWeight = (bird.we / 100).toFixed(2);
        const maxLimit = ((bird.we * 5.8) / 100).toFixed(2);
        return `
        <tr>
            <td>${bird.i}</td>
            <td>${bird.name}</td>
            <td>${bird.period}</td>
            <td>${minWeight}</td>
            <td>${maxWeight}</td>
            <td>${maxLimit}</td>
            <td>${bird.exp}</td>
            <td>${bird.baitName || '-'}</td>
            <td>${bird.baitField || '-'}</td>
            <td>${bird.skill ? bird.skill.skillId : '-'}</td>
            <td>${bird.skill ? bird.skill.position : '-'}</td>
            <td>${bird.skill ? bird.skill.skillName : '-'}</td>
            <td>${bird.skill ? bird.skill.skillDescription : '-'}</td>
        </tr>
        `;
    }).join('');
}

var request = require("request"),
	cheerio = require("cheerio"),
    fs = require("fs"),
    score = [],
	count = 0,
	gpa_total=0,
	credit_total=0;

if (process.argv.length != 4){
    console.log('usage: node login.js [id] [password] ')
    return 0;
}

request.post({
      url: "http://120.117.2.132/CourSel/Login.aspx",
      form: {'__EVENTTARGET' : '',
        '__EVENTARGUMENT' : '',
        '__VIEWSTATE' : '/wEPDwUIODc3ODc3MTlkZGs0hjL5S9HpSDL/Su6nK8R121w8',
        '__VIEWSTATEGENERATOR' : '975AEEEC' ,
        '__EVENTVALIDATION' : '/wEWBQLHlriDAQKUvNa1DwL666vYDAKnz4ybCALM9PumD7O1wjaAeVtrt6/GmxTQRUri0zMA',
        'Login1$UserName' : process.argv[2],
        'Login1$Password': process.argv[3] ,
        'Login1$LoginButton':'登入'} ,
      jar: true
    }, _GET_Identity);

function _GET_Identity (err ,res ,b) {
    if (!err && res.statusCode == 302) {

        // Show the name and ID
        request.post({
            url: "http://120.117.2.132/CourSel/Board.aspx",
            jar: true
        },function(e,r,b){
            if(e || !b) { return; }
            var $ = cheerio.load(b);
            var Class = $("span#ctl00_lab_show_pclass");
            var Stu_id = $("span#ctl00_lab_show_pstudno");
            var Stu_name = $("span#ctl00_lab_show_pname");
            console.log('Class:',Class.text());
            console.log('ID:',Stu_id.text());
            console.log('Name:',Stu_name.text());
            _GET_Score();
        });
    };
}

function _GET_Score (err,res,b){

        // Show all of the score
        request.post({
            url: "http://120.117.2.132/CourSel/Pages/PastScore.aspx",
            jar: true
        },function(e,r,b){
            if(e || !b) { return; }
            var $ = cheerio.load(b);
            var sub = $("#ctl00_ContentPlaceHolder1_GridView1 td");
            var sco = $("#ctl00_ContentPlaceHolder1_GridView1 td span");
            
            var g=1
            for(i=0; i<=sub.length; i=i+g) {
                if(sub.eq(i).text()=='操行'){
                	var the_score=sub.eq(i+3).text().match(/\d+/)[0];
                	var the_credit=sub.eq(i+2).text().match(/\d+/)[0];
                    score.push([sub.eq(i).text(),the_score, the_gpa(the_score,the_credit) ]);
                    g=4;
                    continue;
                }

                if( !isNaN(sub.eq(i).text() ) ){g=1;continue;}
            	var the_score=sub.eq(i+3).text().match(/\d+/)[0];
            	var the_credit=sub.eq(i+2).text().match(/\d+/)[0];
                score.push([sub.eq(i).text(),the_score, the_gpa(the_score,the_credit) ]);
            }
            console.log(score);
            console.log('GPA_total:',gpa_total);
            console.log('Credit_total:',credit_total);
            console.log('GPA:',gpa_total/credit_total);
        })
}

function the_gpa(the_score,the_credit){
	if ( the_score > 80 ){
		gpa=4
	}else if( the_score > 70 ){
		gpa=3
	}else if( the_score > 60 ){
		gpa=2
	}else if( the_score > 50 ){
		gpa=1
	}else{
		gpa=0
	}

	gpa_total+=gpa*the_credit;
	credit_total+=parseFloat(the_credit);
	return gpa;
}
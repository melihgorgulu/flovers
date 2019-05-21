const fs = require("fs"),
    mocha = require("mocha"),
    assert = require("assert"),
    loader = require("./loader")
;
let missed=0;
let passed=0;
describe("FLOVERS TEST SUITE", function () {
    describe("test constrains", function () {
        it("Reject images not image/*", function (done) {
            loader.testImg("flower_labels.csv",function(err,res,body){
                if(err){
                    done(err);
                    return;
                }
                if(!res.statusCodse==200)
                    done(false);
                else
                    done(null);
            });
        });

        it("accepted max filesize 5MB",function(done){
            loader.testImg("bigimage.dummy",function(err,res,body){
                if(err){
                    done(err);
                }
                else{
                    done();
                }
            });
        });
    });

    describe("test model", function () {
        loader.getTestData(10)
            .forEach(function(img){
                it("predicting image "+img.file,function(done){
                    let that=this;
                    loader.testImg(img.file,function(err,res,body){
                        if(err){
                            missed++;
                            that.skip();
                            return;
                        }
                        if(res.statusCode!=200){
                            missed++;
                            that.skip();
                            return;
                        }
                        body=JSON.parse(body);
                        if(body.predicted==img.label){
                            done();
                            passed++;
                        }else{
                            missed++;
                            that.skip();
                        }
                    });
                });
            });
    });


});

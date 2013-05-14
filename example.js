var isAPI    = require('./bin');
var assert   = require("assert");

var api = isAPI();

api.host('staging-api.formagg.io');

var test1 = _.clone(api);

describe('/relationship', function(done) {   

  // it('should retreive a maker', function(done){
  //   _.clone(api)
  //     .path('/maker/510df090da57f2000000011e')
  //     .json()
  //     .get()
  //     .debug(false)
  //     .assertions(
  //       { 
  //         '$.name': function(val) { assert.equal(val, 'Lactalis') } 
  //       }
  //     )
  //     .done(done);
  //   }
  // );

  it('should give us the new maker', function(done){
    _.clone(api)
      .path('/maker')
        .query('a=111')
        .query( [ 't=11', 'r4=222'])
        .query('b=111')
      .json()
      .post( 
        {
          name: 'This little test',
          source: 'cow',
          texture: 'Blue'
        }
      )
      .debug(true)
      .assertions(
        { 
          '$.statusCode': function(val) { assert.equal(val, 401) },
          '$.data': function(val) { assert.equal(val, 'Unauthorized') },
          '$.raw': function(val) { assert.equal(val, '111') }
        }
      )
      .done(done);
    }
  );

});

    // .parse(
    //   function(d) { 
    //     console.log(d.name)
    //     return d.name
    //   }
    // )

// test1
//   .url('/maker')
//   .post( 
//    {
//       name: 'Bobo Creamery',
//       country: 'United States',
//       state: 'Vermont'
//    }
//   )
//   .success(
//     {
//       t1: 'assert.equal(1, 1)',
//       t2: 'assert.equal(1, 1)'
//     }
//   )
//   .done();

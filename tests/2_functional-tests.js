const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const CURR_TEST = 0; // +2 with every test
const PROJ_NAME = 'newtest';
const USER_JANE = 'Jane_Doe';
const USER_JOHN = 'John_Doe';
const TEST_OBJ_KEYS = [
  'issue_title',
  'issue_text',
  'created_by',
  'assigned_to',
  'status_text',
  'created_on',
  'updated_on',
  '_id',
  'open'
];

let TEST_ID;
let DEL_ID;
const FAKE_ID = '12345rfds';

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('POST request to /api/issues/{project}', function() {
    // #1
    test('Create an issue with every field completed', function(done) {
      chai
      .request(server)
      .post(`/api/issues/${PROJ_NAME}`)
      .send({
        "issue_title": `Issue ${CURR_TEST}`,
        "issue_text": "Test issue created",
        "created_by": USER_JANE,
        "assigned_to": USER_JANE,
        "status_text": "In progress"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, `Issue ${CURR_TEST}`);
        assert.equal(res.body.issue_text, "Test issue created");
        assert.equal(res.body.created_by, USER_JANE);
        assert.equal(res.body.assigned_to, USER_JANE);
        assert.equal(res.body.status_text, "In progress");
        assert.isDefined(res.body.created_on);
        assert.isDefined(res.body.updated_on);
        assert.isDefined(res.body._id);
        assert.equal(res.body.open, true);
        DEL_ID = res.body._id;
        done();
      });
    });
    // #2
    test('Create an issue with required fields only', function(done) {
      chai
      .request(server)
      .post(`/api/issues/${PROJ_NAME}`)
      .send({
        "issue_title": `Issue ${CURR_TEST + 1}`,
        "issue_text": "Test issue created",
        "created_by": USER_JOHN
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, `Issue ${CURR_TEST + 1}`);
        assert.equal(res.body.issue_text, "Test issue created");
        assert.equal(res.body.created_by, USER_JOHN);
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.isDefined(res.body.created_on);
        assert.isDefined(res.body.updated_on);
        assert.isDefined(res.body._id);
        assert.equal(res.body.open, true);
        TEST_ID = res.body._id;
        done();
      });
    });
    // #3 
    test('Create an issue with missing required fields', function(done) {
      chai
      .request(server)
      .post(`/api/issues/${PROJ_NAME}`)
      .send({
        "issue_title": `Issue ${CURR_TEST + 2}`,
        "issue_text": "Test issue created"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
    })
  });
  suite('GET request to /api/issues/{project}', function() {
    // #4
    test('View issues on a project', function(done) {
      chai
      .request(server)
      .get(`/api/issues/${PROJ_NAME}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        res.body.forEach(x => assert.containsAllKeys(x, TEST_OBJ_KEYS));
        done();
      });
    });
    // #5
    test('View issues on a project with one filter', function(done) {
      chai
      .request(server)
      .get(`/api/issues/${PROJ_NAME}?assigned_to=${USER_JANE}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        res.body.forEach(x => assert.containsAllKeys(x, TEST_OBJ_KEYS));
        res.body.forEach(x => assert.propertyVal(x, "assigned_to", USER_JANE));
        done();
      });
    });
    // #6
    test('View issues on a project with multiple filters', function(done) {
      chai
      .request(server)
      .get(`/api/issues/${PROJ_NAME}?created_by=${USER_JOHN}&open=true`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        res.body.forEach(x => assert.containsAllKeys(x, TEST_OBJ_KEYS));
        res.body.forEach(x => assert.propertyVal(x, "created_by", USER_JOHN));
        res.body.forEach(x => assert.propertyVal(x, "open", true));
        done();
      });
    });
  });
  suite('PUT request to /api/issues/{project}', function() {
    // #7
    test('update one field on an issue', function(done) {
      chai
      .request(server)
      .put(`/api/issues/${PROJ_NAME}`)
      .send({ 
        "_id": TEST_ID, 
        "assigned_to": USER_JOHN 
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, TEST_ID);
        done();
      });
    });
    // #8
    test('update multiple fields on an issue', function(done) {
      chai
      .request(server)
      .put(`/api/issues/${PROJ_NAME}`)
      .send({
        "_id": TEST_ID,
        "status_text": "runaround implemented",
        "issue_text": "Test issue runaround tweak"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, TEST_ID);
        done();
      });
    });
    // #9
    test('attempt update without _id', function(done) {
      chai
      .request(server)
      .put(`/api/issues/${PROJ_NAME}`)
      .send({
        "status_text": "new runaround implemented",
        "issue_text": "New test issue runaround tweak"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
    });
    // #10
    test('attempt update without update fields', function(done) {
      chai
      .request(server)
      .put(`/api/issues/${PROJ_NAME}`)
      .send({
        "_id": TEST_ID
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, TEST_ID);
        done();
      });
    });
    // #11
    test('attempt update with wrong _id', function(done) {
      chai
      .request(server)
      .put(`/api/issues/${PROJ_NAME}`)
      .send({
        "_id": FAKE_ID,
        "status_text": "runaround implemented"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, FAKE_ID);
        done();
      });
    });
  });
  suite('DELETE request to /api/issues/{project}', function() {
    // #12
    test('delete with correct id', function(done) {
      chai
      .request(server)
      .delete(`/api/issues/${PROJ_NAME}`)
      .send({ "_id": DEL_ID })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, DEL_ID);
        done();
      });
    });
    // #13
    test('delete with no id', function(done) {
      chai
      .request(server)
      .delete(`/api/issues/${PROJ_NAME}`)
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
    });
    // #14
    test('delete with invalid id', function(done) {
      chai
      .request(server)
      .delete(`/api/issues/${PROJ_NAME}`)
      .send({ "_id": FAKE_ID })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, FAKE_ID);
        done();
      });
    });
  });
});

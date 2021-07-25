'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const DB = process.env['MONGO_URI'];
const ISSUE_OBJ_SCHEMA = [
  'issue_title',
  'issue_text',
  'created_on',
  'updated_on',
  'created_by',
  'assigned_to',
  'open',
  'status_text'
]

module.exports = function (app) {

  mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
  const issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    open: { type: Boolean, required: true },
    status_text: String
  });

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      let queries = {};
      ISSUE_OBJ_SCHEMA.forEach(x => {
        if (x in req.query) {
          queries[x] = req.query[x];
        }
      });
      let Issue = mongoose.model(project, issueSchema);
      Issue.find(queries, function(err, docs) {
        if (err) {
          res.status(200).json({ error: 'unable to locate project or issues' });
        } else {
          res.status(200).json(docs);
        }
      })
    })
    
    .post(function (req, res){
      const project = req.params.project;
      let Issue = mongoose.model(project, issueSchema);
      let issue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: req.body.created_on || Date.now(),
        updated_on: req.body.updated_on || Date.now(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: req.body.open || true,
        status_text: req.body.status_text || ""
      });
      issue.save(function(err, doc) {
        if (err) {
          res.status(200).json({ error: "required field(s) missing" });
        } else {
          res.status(200).json(doc);
        }
      });
    })
    
    .put(function (req, res){
      const project = req.params.project;
      var _id;
      
      if (!req.body._id) {
        res.status(200).json({ error: "missing _id" });
        return;
      } else {
        _id = req.body._id;
      }
      
      let update = {};
      ISSUE_OBJ_SCHEMA.forEach(x => {
        if (x in req.body) {
          update[x] = req.body[x];
        }
      });
      if (Object.keys(update).length === 0) {
        res.status(200).json({ error: "no update field(s) sent", _id: _id });
        return;
      } else {
        update.updated_on = Date.now();
      }

      let Issue = mongoose.model(project, issueSchema);
      Issue.findByIdAndUpdate(_id, update, { new: true }, function(err, doc) {
        if (err) {
          res.status(200).json({ error: "could not update", _id: _id });
        } else {
          if (!doc) {
            res.status(200).json({ error: "could not update", _id: _id });
          } else {
            res.status(200).json({ result: "successfully updated", _id: doc._id });
          }
        }
      })
    })
    
    .delete(function (req, res){
      const project = req.params.project;
      var _id;
      if (!req.body._id) {
        res.status(200).json({ error: "missing _id" });
        return;
      } else {
        _id = req.body._id;
      }

      let Issue = mongoose.model(project, issueSchema);
      Issue.findByIdAndDelete(_id, function(err, doc) {
        if (err) {
          res.status(200).json({ error: "could not delete", _id: _id });
        } else {
          if (!doc) {
            res.status(200).json({ error: "could not delete", _id: _id });
          } else {
            res.status(200).json({ result: "successfully deleted", _id: doc._id });
          }
        }
      })
    });
    
};

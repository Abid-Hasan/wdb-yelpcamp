var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err || !campground) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});

// CREATE
router.post("/", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err || !campground) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          console.log(err);
        } else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save comment
          comment.save();

          campground.comments.push(comment);
          campground.save();
          req.flash("success", "Comment has been added successfully");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err || !campground) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      Comment.findById(req.params.comment_id, function (err, comment) {
        if (err) {
          console.log(err);
          res.redirect("back");
        } else {
          res.render("comments/edit", { campground: campground, comment: comment });
        }
      });
    }
  });
});

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, comment) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment has been updated successfully");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function (err) {
    if(err) {
      console.log(err);
      res.redirect("back");
    } else {
      req.flash("success", "Comment has been deleted successfully");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
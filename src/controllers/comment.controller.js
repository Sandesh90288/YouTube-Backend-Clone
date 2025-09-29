
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    //? ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10', 
    //?     'C11','C12','C13','C14','C15','C16','C17','C18','C19','C20']
    //? This is the data that is stored in the database
    //? Page 1, limit 10 → return C1 to C10
    //? Page 2, limit 10 → return C11 to C20

    const comments = await Comment.find({video: videoId}).skip((page - 1) * limit).limit(limit).sort({createdAt: -1});
    //? skip is used to skip the number of comments that are already fetched
    //? limit is used to limit the number of comments that are fetched
    //? sort is used to sort the comments by createdAt in descending order\
    
    const totalComments = await Comment.countDocuments({video: videoId});
    //? totalComments is used to count the total number of comments that are stored in the database
    //? totalPages is used to count the total number of pages that are stored in the database
    let comment={
        comments:comments,
        totalComments:totalComments,
        totalPages:totalPages
    }
    const totalPages = Math.ceil(totalComments / limit);
    return res.status(200).json(new ApiResponse(200, comment, "Comments fetched successfully", totalPages));
})

// Add a comment to a specific video
const addComment = asynchandler(async (req, res) => {
    // Destructure content and videoId from request body
    const { content, videoId } = req.body;
  
    // Get the logged-in user from the request (set by authentication middleware)
    const user = req.user;
  
    // -----------------------
    // 1️⃣ Validate input
    // -----------------------
    if (!content) {
      // If comment content is missing, throw an error
      throw new ApiError(400, "Comment content is required");
    }
  
    if (!videoId) {
      // If videoId is missing, throw an error
      throw new ApiError(400, "Video ID is required");
    }
  
    if (!user) {
      // If user is not logged in or missing, throw an error
      throw new ApiError(400, "User must be logged in to comment");
    }
  
    // -----------------------
    // 2️⃣ Create a new comment
    // -----------------------
    // We associate the comment with:
    // - video: the video the user is commenting on
    // - owner: the user who made the comment
    // - content: the text of the comment
    const comment = new Comment({
      video: videoId,
      owner: user._id, // store user ID, not the full object
      content: content,
      isEdited: false
    });
  
    // -----------------------
    // 3️⃣ Save the comment to MongoDB
    // -----------------------
    await comment.save();
  
    // -----------------------
    // 4️⃣ Return response to frontend
    // -----------------------
    // Wrap in ApiResponse for consistent API format
    return res.status(200).json(
      new ApiResponse(200, comment, "Comment added successfully")
    );
  });
  

  const updateComment = asynchandler(async (req, res) => {
    const { commentId } = req.params; // Get comment ID from URL
    const { content } = req.body;     // Get updated content from request body
  
    if (!content) {
      throw new ApiError(400, "Updated content is required");
    }
  
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
  
    // Update the comment
    comment.content = content;
    comment.isEdited = true; // mark as edited
    await comment.save();
  
    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
  });
  

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    const comment=await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
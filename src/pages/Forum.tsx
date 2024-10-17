import React, { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Flag, Image, Paperclip, ChevronDown, ChevronUp } from 'lucide-react'

interface Comment {
  id: number
  author: string
  content: string
  date: string
  likes: number
  replies: Comment[]
  media?: string
  reported: { [userId: string]: boolean }
}

interface Post {
  id: number
  title: string
  content: string
  author: string
  date: string
  likes: number
  comments: Comment[]
  media?: string
  reported: { [userId: string]: boolean }
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [currentUser] = useState('Anonymous') // Replace with actual user authentication

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = () => {
    try {
      const storedPosts = localStorage.getItem('forumPosts')
      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts)
        const updatedPosts = parsedPosts.map((post: Post) => ({
          ...post,
          comments: (post.comments || []).map((comment: Comment) => updateCommentStructure(comment)),
          reported: post.reported || {}
        }))
        setPosts(updatedPosts)
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts. Please try again later.')
    }
  }

  const updateCommentStructure = (comment: Comment): Comment => {
    return {
      ...comment,
      replies: (comment.replies || []).map(updateCommentStructure),
      reported: comment.reported || {}
    }
  }

  // ... (rest of the component code remains the same)

  const renderComments = (comments: Comment[], postId: number, depth: number = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`ml-${depth * 4} mt-2 border-l-2 border-gray-200 pl-4`}>
        <p className="text-sm text-gray-600">{comment.author} - {new Date(comment.date).toLocaleString()}</p>
        <p className="mt-1">{comment.content}</p>
        {comment.media && (
          <div className="mt-2">
            {comment.media.endsWith('.mp4') ? (
              <video src={comment.media} controls className="w-full rounded" />
            ) : (
              <img src={comment.media} alt="Comment media" className="w-full rounded" />
            )}
          </div>
        )}
        <div className="mt-2 flex items-center space-x-4">
          <button
            className="text-sm text-gray-500 hover:text-green-600"
            onClick={() => handleLikeComment(postId, comment.id)}
          >
            <ThumbsUp size={16} /> {comment.likes}
          </button>
          <button
            className={`text-sm ${comment.reported[currentUser] ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
            onClick={() => handleReportComment(postId, comment.id)}
            disabled={comment.reported[currentUser]}
          >
            <Flag size={16} /> {Object.keys(comment.reported || {}).length}
          </button>
        </div>
        <ReplyForm postId={postId} parentCommentId={comment.id} onSubmit={handleAddReply} />
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, postId, depth + 1)}
      </div>
    ))
  }

  // ... (rest of the component code remains the same)

  return (
    <div className="space-y-8">
      {/* ... (rest of the JSX remains the same) */}
    </div>
  )
}

export default Forum
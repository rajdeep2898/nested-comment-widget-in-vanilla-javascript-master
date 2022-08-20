// get the input box for main comment
const mainComment = document.getElementById("myInput");

// to get the comment list conatiner so that we can use the evenet delegation
const commentList = document.getElementById("commentList");

let sortByLikes = () => {
	comments = JSON.parse(localStorage.getItem("comments"));
	comments.sort((a,b) => (a.Likes < b.Likes) ? 1 : ((b.Likes < a.Likes) ? -1 : 0))
	localStorage.setItem("comments", JSON.stringify(comments));
	finalCommentsViewPage();

}
let sortByDate = () => {
	comments = JSON.parse(localStorage.getItem("comments"));
	comments.sort((a,b) => (a.timeStamp < b.timeStamp) ? 1 : ((b.timeStamp < a.timeStamp) ? -1 : 0))
	localStorage.setItem("comments", JSON.stringify(comments));
	finalCommentsViewPage();

}
// to add a new comment
let addComment = () => {
	if (!localStorage.getItem("comments")) {
		let comments = [];
		localStorage.setItem("comments", JSON.stringify(comments));
	}
	const d = new Date();
	d.getTime();

	comments = JSON.parse(localStorage.getItem("comments"));
	comments.push({
		parentCommentId: null,
		commentId: Math.random()
			.toString()
			.substr(2, 7),
		commentText: mainComment.value,
		childComments: [],
		Likes: 0,
		timeStamp: new Date().getTime()
	});
	localStorage.setItem("comments", JSON.stringify(comments));
	finalCommentsViewPage();
	mainComment.value = "";
};

// create a reply button
let createReplyButtonCommentView = (id, operationType, commentOldData) => {
	let div = document.createElement("div");
	div.setAttribute("data-parentId", id);
	div.innerHTML = `<input type="text" value="${
		operationType === "update Comment" ? commentOldData : ""
	}"> <a href="#">${operationType}</a>`;

	return div;
};
// genarate a single comment view card

{/* <div class="dialogbox">
<div class="body">
  <span class="tip tip-up"></span>
  <div class="message">
	<span>I just made a comment about this comment box which is purely made from CSS.</span>
  </div>
</div>
</div> */}

// let singleCommentCard = (obj, padding) => `
//     <div class="dialogbox" style=" margin-left: ${padding}px; " data-parentId="${
// 	obj.parentCommentId
// }" id="${obj.commentId}">
// <div class="body">
// <span class="tip tip-left"></span>
//     <span>${obj.commentText}</span>
// </div>
//     </div>
// 	<a href="#">Likes</a><span style="color: red"> ${
// 		obj.Likes === 0 ? "" : obj.Likes
// 	}</span>
// <a href="#"><i id= "Reply" class="fas fa-reply">Reply</i></a><span style="color: red"> ${
// 		obj.childComments.length === 0 ? "" : obj.childComments.length
// 	}</span>
// <a href="#"> Edit</a>
// <a href="#"> Delete </a>
//     `;

	let singleCommentCard = (obj, padding) => `
    <div class="dialogbox" style=" margin-left: ${padding}px; " data-parentId="${
		obj.parentCommentId
	}" id="${obj.commentId}">
	<div class="body">
	<span class="tip tip-${padding==0? "left":"up"}"></span>
		<span>${obj.commentText}</span>
	</div>
        <a href="#"><i class="fas fa-thumbs-up"></i> Likes</a><span style="color: red"> ${
					obj.Likes === 0 ? "" : obj.Likes
				}</span>
        <a href="#"><i id= "Reply" class="fas fa-reply"></i> Reply</a><span style="color: red"> ${
					obj.childComments.length === 0 ? "" : obj.childComments.length
				}</span>
        <a href="#"> Edit</a>
        <a href="#"> Delete </a>
    </div>
    `;

// a recursive method to generate a view if there are nested comment childrens
let createRecusiveView = (commentList, padding = 0) => {
	let fullView = "";
	for (let i of commentList) {
		fullView += singleCommentCard(i, padding);
		if (i.childComments.length > 0) {
			fullView += createRecusiveView(i.childComments, (padding += 20));
			padding -= 20;
		}
	}
	return fullView;
};
// recursive to increase the likes by 1
let increaseLikeByOne = (allComments, newCommentLikeId) => {
	for (let i of allComments) {
		if (i.commentId === newCommentLikeId) {
			i.Likes += 1;
		} else if (i.childComments.length > 0) {
			increaseLikeByOne(i.childComments, newCommentLikeId);
		}
	}
};

// final view to generate all the comments
let finalCommentsViewPage = () => {
	let getCommentsFromLocalStorage = JSON.parse(
		localStorage.getItem("comments")
	);
	if (getCommentsFromLocalStorage) {
		let allComments = createRecusiveView(getCommentsFromLocalStorage);
		commentList.innerHTML = allComments;
	}
};

finalCommentsViewPage();

// recursive method to push the new child comment
let addNewChildComment = (allComments, newComment) => {
	for (let i of allComments) {
		if (i.commentId === newComment.parentCommentId) {
			i.childComments.push(newComment);
		} else if (i.childComments.length > 0) {
			addNewChildComment(i.childComments, newComment);
		}
	}
};

// get all comments from local storage
let getAllComments = () => JSON.parse(localStorage.getItem("comments"));

// set comments object again in local storage
let setAllComments = allComments =>
	localStorage.setItem("comments", JSON.stringify(allComments));

// recursive method to update the comment
let updateComment = (allComments, updatedCommentId, updatedCommentText) => {
	for (let i of allComments) {
		if (i.commentId === updatedCommentId) {
			i.commentText = updatedCommentText;
		} else if (i.childComments.length > 0) {
			updateComment(i.childComments, updatedCommentId, updatedCommentText);
		}
	}
};

// recursive function for deleting a single comment
let deleteComment = (allComments, newCommentId) => {
	for (let i in allComments) {
		if (allComments[i].commentId === newCommentId) {
			allComments.splice(i, 1);
		} else if (allComments[i].childComments.length > 0) {
			deleteComment(allComments[i].childComments, newCommentId);
		}
	}
};
// Event delegation for "comment", "edit comment", "like", "update comment" click and "add new child" comment in existing comments
commentList.addEventListener("click", e => {
	if (e.target.innerText === " Reply") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;
		currentParentComment.appendChild(
			createReplyButtonCommentView(parentId, "Add Comment")
		);
		e.target.style.display = "none";
		e.target.nextSibling.style.display = "none";
	} else if (e.target.innerText === "Add Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const newAddedComment = {
			parentCommentId: parentId,
			commentId: Math.random()
				.toString()
				.substr(2, 7),
			commentText: e.target.parentNode.firstChild.value,
			childComments: [],
			Likes: 0
		};
		let getCommentsFromLocalStorage = getAllComments();
		addNewChildComment(getCommentsFromLocalStorage, newAddedComment);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === " Likes") {
		let getCommentsFromLocalStorage = getAllComments();
		increaseLikeByOne(getCommentsFromLocalStorage, e.target.parentNode.id);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Edit") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.parentNode;

		const complateCommentText = e.target.parentNode.innerText;
		const commentToArray = complateCommentText.split(" ");
		const findIndexOfLikes = commentToArray.indexOf("Likes");
		const realComment = commentToArray.slice(0, findIndexOfLikes);

		currentParentComment.appendChild(
			createReplyButtonCommentView(
				parentId,
				"update Comment",
				realComment.join(" ")
			)
		);
		e.target.style.display = "none";
	} else if (e.target.innerText === "update Comment") {
		const parentId = e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");

		let getCommentsFromLocalStorage = getAllComments();
		updateComment(
			getCommentsFromLocalStorage,
			parentId,
			e.target.parentNode.firstChild.value
		);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Delete") {
		const parentId = e.target.parentNode.getAttribute("id");
		let getCommentsFromLocalStorage = getAllComments();
		deleteComment(getCommentsFromLocalStorage, parentId);
		setAllComments(getCommentsFromLocalStorage);
		finalCommentsViewPage();
	}
});

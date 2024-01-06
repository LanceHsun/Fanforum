import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// __dirname isn't available in ES modules, so we derive it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup your static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
let article_list = [
  {"title": "title", "content":"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd ", "index":0}
]

app.get("/", (req, res) => {
// render index.ejs using the content of article_list
console.log(article_list);
res.render("index", { articles: article_list });
});

// There are many articles will generate different routes with different index. So the route is dynamic. 
app.get("/article_:index", (req, res) => {
  // Render /article.ejs using the target article with correct index
  const index = parseInt(req.params.index);
  const article = article_list.find(a => a.index === index);
  res.render("article", { article });
  });

  app.get("/article_:index/download", (req, res) => {
    const index = parseInt(req.params.index);
    const article = article_list.find(a => a.index === index);
  
    // 确保文章存在
    if (!article) {
      return res.status(404).send("Article not found");
    }
  
    // 使用 RFC 5987 编码方法处理文件名
    const filename = encodeURIComponent(article.title).replace(/['()]/g, escape).replace(/\*/g, '%2A').replace(/%(?:7C|60|5E)/g, unescape) + '.txt';
  
    // 设置Content-Disposition头部，包括编码后的文件名
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(article.content);
  });
  

app.get("/article_:index/edit", (req, res) => {
  const index = parseInt(req.params.index);
  const article = article_list.find(a => a.index === index);
  res.render("edit", { article });
      });


app.get("/edit", (req, res) => {
  // Render /edit.ejs without passing any existing article
  const emptyArticle = { title: '', content: '', index: null };
  res.render("edit", { article: emptyArticle });
});
      


app.post("/", (req, res) => {
  // Assume that the article index is sent as a hidden input in the form if editing an existing article
  const index = req.body.index ? parseInt(req.body.index) : article_list.length;

  const newArticle = {
    title: req.body.title,
    content: req.body.content,
    index: index
  };

  // Find the index in the array if it exists
  const existingArticleIndex = article_list.findIndex(article => article.index === index);

  if (existingArticleIndex > -1) {
    // Update the existing article
    article_list[existingArticleIndex] = newArticle;
  } else {
    // Add a new article
    article_list.push(newArticle);
  }

  res.redirect(`/article_${index}`);
});


app.post("/article_:index/delete", (req, res) => {
// get the index of deleted article, remove the article from the article_list, and redirect to get route / 
const index = parseInt(req.body.index);
  article_list = article_list.filter(article => article.index !== index);
  res.redirect("/");
});

// Listen to the server on port 3000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});



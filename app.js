// Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
// Configurações
    // Sessão
        app.use(session({
            secret: "kelvin201812i",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash());
    // Midleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next();
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/blogapp', {
        useNewUrlParser: true
    }).then(() => {
        console.log('MongoDB conectado...')
    }).catch((err) => {
        console.log('Houve um erro ao se conectar ao MongoDB' + err)
    });
    // Public
        app.use(express.static(path.join(__dirname,"public")))
// Rotas
    app.get('/', (req, res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
        
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Essa postagem não existe')
                res.redirect('/')
            }
        }).catch((error) => {
            req.flash('error_msg', 'Houve um error interno')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((error) => {
            req.flash('error_msg', 'Houve um error interno ao listar as categorias!')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                
                Postagem.find({categoria: categoria._id}).then((postagens) => {

                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})

                }).catch((error) => {
                    req.flash('error_msg', 'Houve um error ao listar os posts')
                    res.redirect('/')
                })

            }else{
                req.flash('error_msg', 'Esta categorias não existe!')
                res.redirect("/")
            }
        }).catch((error) =>{ 
            req.flash('error_msg', 'Houve um error interno ao carregar a página desta categoria!')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Error 404!')
    })

    app.get('/posts', (req, res)=>{
        res.send('Lista Posts')
    })

    app.use('/admin', admin);
// Outros
const PORT = 8081;
app.listen(PORT,() => {
    console.log('Servidor rodando! ');
})
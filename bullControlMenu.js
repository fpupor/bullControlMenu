/**
 * @alias bullControlMenu
 * @author Felipe P Rodrigues, Criaturas e ajuda de Muca
 * 
 * @param bullControlMenu({
 * @param backup @return bolean
 * @param startNow @return bolean
 * @param container @return array
 * @param content @return auto
 * @param get @return string
 * @param itens @return array
 * @param actived @return object
 * @param method @return string
 * @param temp @return objects
 * @param fnStart() @return object
 * @param fnStartListener() @return object
 * @param fnStopListener() @return object
 * @param fnOnClick() @return object
 * @param fnReset() @return null
 * @param fnBackup() @return objects
 * })
 * @classDescription cria 1 ou varios controles de menu (links)
 * @version 1.1
 */
bullControlMenu = new Class({
	started:false,
	st:{
	startNow : true, //auto inicializacao, defina false para nao iniciar automaticamente
	container: null, // lugar onde contem varios itens a serem inseridos
	content: false, // local onde adiciona o novo arquivo html etc
	get:'a', // procura get em containers e adiciona nos itens
	itens: [], //todos os itens dos container
	actived: null, // o item atual que esta ativo
	method: 'get', // metodo de envio por ajax
	temp:[], //guarda o backup
	contentUpdate: true,
	cache:true,
	hash:true,
	history:{},
	fnStart:function(){}, // ao iniciar execute
	fnStartListener:function(){},
	fnStopListener:function(){},
	fnDestroyListeners:function(){},
	fnOnClick:function(){},  // quando o objeto for clicado execute
	fnReset:function(){},
	fnBackup:function(){},
	fnSuccess:function(){},
	fnFailure:function(){},
	enableClick:true
	},
	/**
	 * iniciando a base da classe bullControlMenu
	 * é necessario passar os setings basicos
	 * @param {Object} st
	 */
	initialize: function(st){
		this.st = $merge(this.st,st);
		$extend(this,this.st);
        
		if(this.startNow && !this.started) this.start(); else this.reset();
	},
	/**
	 * inicia o novo menu criado, cria novos parametros dentro
	 * dos objetos como retorno.
	 * Ex. $('meulinkcriado').hrof = href
	 * @return parent, hrof, href, method, content, this.fnStart(item);
	 */
	start: function(){ 
		if($$(this.container)[0]){
		    this.started = true;

		    $$(this.container).each(function(place, index){	    	
			    this.itens.extend(place.getElements(this.get));
		    },this);

			var page = window.location.hash;
			
		    this.itens.each(function(item, index){ 
			    item.parent = this;
			    item.hrof = item.href;
			    item.href = "javascript: void(0);";
			    item.method = (item.method) ? item.method : this.method;
			    item.content = (item.target) ? item.target : this.content;
			    if(item.target) item.removeProperty('target');
			    this.startListener(item);
			    
				if(this.hash && page && !this.pageActive){
					if(item.hrof.contains(page.substr(1))){
						this.pageActive = item;
					}
				}
			    this.fnStart(item);
		    },this);
		}
		if(this.pageActive)
			this.onClick(this.pageActive);
	},
	/**
	 * reseta as propriedades do menu
	 */
	reset:function(){
		//console.dir(this.itens);
		$extend(this,this.st); this.start();
		//console.dir(this.itens);
	},
	/**
	 * inicia a observacao no item, adicionando um evento onClick
	 * @param {Object} item
	 * @return item.active, this.fnStartListener(item);
	 */
	startListener: function(item){
		item.active = true;
		if($type(item.addEvent))
		item.addEvent('click', function(){this.parent.onClick(this);} );
		this.fnStartListener(item);
	},
	/**
	 * para o onClick
	 * @param {Object} item
	 * @return item.active, this.fnStopListener(item);
	 */
	stopListener:function(item){
		item.active = false;
		item.removeEvents('click');
		this.fnStopListener(item);
	},
	/**
	 * cancela a observacao do evendo onClick, 
	 * carrega conteudo do item.hrof dentro do item.content no metodo item.method
	 * adiciona a observacao do onclick no this.actived
	 * @param {Object} item
	 * @return this.fnOnclick(item);
	 */
	onClick: function(item){
		if(!this.enableClick) return; else this.enableClick = false;
		this.stopListener(item);

		if(item.content=='_blank'){
			window.open(item.hrof);
		}
		else
		if(item.content.charAt(0)=="_"){
			document[item.content].location = item.hrof;
		}
		else
		if(!item.hrof.contains('#') && $(item.content)){
			if(this.cache && this.history[item.hrof]){
				this.fnSuccess(item,this.history[item.hrof].text,this.history[item.hrof].xml);
				if(this.contentUpdate){
	            	$(item.content).set('html',this.history[item.hrof].text);
            	}
            	if(this.hash){
	            	var href = item.hrof.split('/').reverse()[0];
					window.location = '#' + href;
				}
			}
			else{
			    this.request = new Request({
			        url:item.hrof,
			        method: item.method,
			        onSuccess: function(t,x){
			            this.fnSuccess(item,t,x);
			            if(this.cache){
			            	var length = 0;
			            	for(x in menuHeader.history) length++;
			            	
			            	if(length >= this.cache){
			            		this.history = {};
			            	}
			            	this.history[item.hrof] = {text:t,xml:x};
			            }
			            if(this.contentUpdate){
			            	$(item.content).set('html',t);
		            	}
		            	if(this.hash){
			            	var href = item.hrof.split('/').reverse()[0];
							window.location = '#' + href;
						}
			        }.bind(this),
			        onFailure: function(x){
			            this.startListener(item);
			            this.fnFailure(item,x);
			        }.bind(this)
			     });		        
			    this.request.send();
		    }
		}else 
		    this.fnSuccess(item);
		
		if(this.actived) this.startListener(this.actived);
		this.actived = item;
		this.enableClick = true;
		this.fnOnClick(item);
	},
	destroyListeners: function(item){
		this.stopListener(item);
		this.itens.remove(item);
		this.actived = null;
		
		item.href = item.hrof;
		item.parent = null;
		item.hrof = null;
		item.method = null;
		item.content = null;
		item.active = null;
		
		this.fnDestroyListeners(item);
	},
	version:'1.5.0'
});
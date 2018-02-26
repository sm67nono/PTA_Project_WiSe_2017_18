

//Static Analysis calls Here : smanna Dec 8, 2017
module.exports={
 analyzeForEachRootCode:function(code) {
    // 1
    console.log("Tool Module: ForEach Root Signatures");
    //Simple tool which searches if there is recursive functions traversing the AST and lists them out: smanna Dec 2, 2017
    var fs = require('fs'),
        esprima = require('esprima');
    var estraverse = require('estraverse');
    var escodg = require('escodegen');


    var functionNames=[];
    //Extracting the following to generate Iterative form
    var bodySection=null;
    //var returnCondition=null;
    var arrayOperatedOn=null;
    var argVariableName=null;

    //Could be moved to a database later
    var dataStore=[];
    var dataFormat={"bodySection":bodySection, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};

	 var ast = esprima.parse(code);
	 //console.log("The AST is:");
	 //console.log(JSON.stringify(ast,null,4));
   estraverse.traverse(ast, {
     enter: function(currentfunctionAST){
       //console.log(currentfunctionAST);
       if (currentfunctionAST.type === 'FunctionDeclaration' || currentfunctionAST.type === 'Program')
       {
         //Storing the Program Structure
         if(currentfunctionAST.type != 'Program')
         {
             if(currentfunctionAST.id.name)
             {
               functionNames.push(currentfunctionAST.id.name);
             }
         }
         else
         {
           functionNames.push("Program");
         }

       }

       //Extracting Filter functions
       //if (currentfunctionAST.type === 'FunctionDeclaration' || currentfunctionAST.type === 'FunctionExpression' || currentfunctionAST.type === 'Program')
       if (currentfunctionAST.type === 'Program')
       {
         estraverse.traverse(currentfunctionAST, {
           enter: function(node){
          var extractedParts=0;
         //console.log(JSON.stringify(currentfunctionAST,null,4));
         var typeOfOp='';
         if(node.callee)
         {
          if(node.callee.property)
            {
              typeOfOp=node.callee.property.name;
            }
          }

          if(extractedParts==1)
          {
            this.break();
          }
          //Prints out Filter functions
          if(typeOfOp=='forEach')
          {
            bodySection=null;
            //returnCondition=null;
            arrayOperatedOn=null;
            argVariableName=null;

            console.log("Is using a  forEach operation.");
            //console.log(node);
            //var argstreeAST=node;
            //console.log(argstreeAST);
            if(node.callee.object.name)
            {
              arrayOperatedOn=node.callee.object.name;
            }
            if(node.arguments[0].params)
            {
              argVariableName=node.arguments[0].params[0].name;
            }
            //Case 1: Filter Function inline
            estraverse.traverse(node, {
                enter: function(nodelvl2){
                  if(nodelvl2.type==="FunctionExpression")
                  {
                    //To get the parent element. Not any child nodes
                    var bodySectionFound=0;


                    //Getting the body section
                    estraverse.traverse(nodelvl2["body"], {
                        enter: function(nodelvl3){
                          if(nodelvl3.type==="BlockStatement" && bodySectionFound==0 )
                          {
                            bodySectionFound=1;
                            if(nodelvl3.body)
                            {
                              //Important:Assuming there is not statement after return. We remove the return statement
                              var tempbody= nodelvl3.body;
                              if(tempbody.length>0)
                              {
                                //tempbody.length=tempbody.length-1;
                                var withoutReturnASTBody=tempbody;
                                bodySection=withoutReturnASTBody;
                                this.break();
                              }
                              else
                              {
                                bodySection='';
                                this.break();
                              }
                            }
                          }
                        }
                      });

                      //Store the contents in the dataStore
                      if(bodySectionFound==1)
                      {
                        dataFormat={"bodySection":bodySection, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
                        dataStore.push(dataFormat);
                        extractedParts=1;
                        this.break();
                      }

                      //For conditions with no body or return condition
                      if(bodySectionFound==0)
                      {
                        dataFormat={"bodySection":'',"arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
                        dataStore.push(dataFormat);
                        extractedParts=1;
                        this.break();
                      }

                  }
                }
              });


          }
       }
     });
   }
 }
});

//===================Substituting values into the template===========================

var createItrFilterTemplate = fs.readFileSync("forEach_frame.js", 'utf-8');

var templateStore=[];
for(var getDataStoreCounter=0;getDataStoreCounter<dataStore.length;getDataStoreCounter++){
var forEach_ast = esprima.parse(createItrFilterTemplate);
estraverse.traverse(forEach_ast, {
  enter: function(filter_node)
  {
    //1. Add the body and the variable name used as args in map, reduce and filter operation
    if(filter_node.type==="ForStatement")
    {
      filter_node.body.body[0].declarations[0].id.name=dataStore[getDataStoreCounter]["argVariableName"];
      for(var addbody=dataStore[getDataStoreCounter]["bodySection"].length-1;addbody>=0;addbody--)
        {
          filter_node.body.body.splice(1,0,dataStore[getDataStoreCounter]["bodySection"][addbody]);
        }
    }

    //2. Add the ArrayName which has the operation map,reduce,filter
    if(filter_node.type==="VariableDeclarator" && filter_node.id.name==="arrayUsingItr")
    {
      filter_node.init.type="Identifier";
      filter_node.init.name=dataStore[getDataStoreCounter]["arrayOperatedOn"];
    }


  }
});


  var storageVariable={};
  storageVariable=forEach_ast;
  templateStore.push(storageVariable);
  }


//Step 3: Replace the original AST having functional pattern

var getFromTemplateStore=0;

//For function declarations
estraverse.traverse(ast, {
    enter: function(node, parent){

    var functionBody=null;
    if(node.type === 'Program')
    {
      //currentFunctionName=node.id.name;
      //Get the function body to change later
      if(node.body)
      {
        if(node.body)
        {
          functionBody=node.body;
        }
      }
      //console.log(JSON.stringify(functionBody,null,4));
      //console.log("===================================");
    for(var loopCount=0;loopCount<functionBody.length;loopCount++)
    {
      var checkNode=functionBody[loopCount];
      var nodeChanged=false;
      //console.log(checkNode);
      //console.log("==================");
      estraverse.traverse(checkNode, {
          enter: function(nodelvl2,parent2){
            if (nodelvl2.type === 'VariableDeclarator')
            {
            if(nodelvl2.init)
            {
              if(nodelvl2.init.type=="CallExpression")
              {
              //console.log(JSON.stringify(currentfunctionAST,null,4));

              var typeOfOp='';
              if(nodelvl2.init.callee)
              {
                if(nodelvl2.init.callee.property)
                {
                  typeOfOp=nodelvl2.init.callee.property.name;
                }
              }
              //Prints out Filter functions
              if(typeOfOp=='forEach')
              {

           nodelvl2.init= { "type": "Identifier","name": "newArray" };
           nodeChanged=true;

        }
       }
      }
     }

     //When not a variable VariableDeclarator

    }
   	});
    //If the node is changed add the AST body before that
    if(nodeChanged)
    {
      console.log("Here");
      if(templateStore[getFromTemplateStore])
      {

        for(var astBody=templateStore[getFromTemplateStore].body.length-1;astBody>=0;astBody--)
        {
          functionBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
        }
        getFromTemplateStore++;

      }//console.log(JSON.stringify(functionBody,null,4));
      //console.log("==========");
    }
  }
}
}


});

//console.log(JSON.stringify(ast,null,4));
var newCode = escodg.generate(ast);

return newCode;

}

};

// 2
/*if (process.argv.length < 3) {
    console.log('Usage: analyze.js <filename>.js');
    process.exit(1);
}

// 3
var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

analyzeCode(code);
console.log('Done');*/

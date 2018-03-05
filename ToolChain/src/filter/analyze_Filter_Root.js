//Static Analysis  Here : smanna Dec 8, 2017

/*
This module is responsible of Pattern Detection of filter in Program Root. The module carries out the following task:

1) Detect the main Program Body for filter patterns.
2) If detected add to to the dataStore the extracted Values.
3) Manufacture from a template an iterative form of the current functional Pattern.
4) Add it to the List.
5) Substitute the values into the AST after checking for patterns if it matches parent signature and other criterea used while storing.
6) CleanUp the markers after the iterative AST is substituted.
7) Generate actual JavaScript from the AST.

*/
module.exports={
 analyzeFilterRootCode:function(code) {
    // 1
    console.log("Tool Module: Filter Program Root signatures");
    //Simple tool which searches if there are functions traversing the AST and lists them out: smanna Dec 2, 2017
    var fs = require('fs'),
        esprima = require('esprima');
    var estraverse = require('estraverse');
    var escodg = require('escodegen');


    var functionNames=[];
    //Extracting the following to generate Iterative form
    var bodySection=null;
    var returnCondition=null;
    var arrayOperatedOn=null;
    var argVariableName=null;

    //Could be moved to a database later
    var dataStore=[];
    var dataFormat={"bodySection":bodySection, "returnCondition":returnCondition, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};

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
          if(typeOfOp=='filter')
          {
            bodySection=null;
            returnCondition=null;
            arrayOperatedOn=null;
            argVariableName=null;

            console.log("Is using a  filter operation.");
            //console.log(node);
            //var argstreeAST=node;
            //console.log(argstreeAST);
            if(node.callee.object)
            {
              arrayOperatedOn=node.callee.object;
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
                    var returnSectionFound=0;
                    //Getting the return section
                    estraverse.traverse(nodelvl2["body"], {
                        enter: function(nodelvl3){
                          //Get the return condition
                          if(nodelvl3.type==="ReturnStatement" && returnSectionFound==0)
                          {
                            returnSectionFound=1;
                            returnCondition=nodelvl3.argument;//Getting the if statement
                            this.break();
                          }
                        }
                      });

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
                                tempbody.length=tempbody.length-1;
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
                      if(bodySectionFound==1 && returnSectionFound==1)
                      {
                        dataFormat={"bodySection":bodySection, "returnCondition":returnCondition, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
                        dataStore.push(dataFormat);
                        extractedParts=1;
                        this.break();
                      }

                      //For conditions with no body or return condition
                      if(bodySectionFound==0 && returnSectionFound==0)
                      {
                        dataFormat={"bodySection":'', "returnCondition":'', "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
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

var createItrFilterTemplate = fs.readFileSync("filter_frame.js", 'utf-8');

var templateStore=[];
for(var getDataStoreCounter=0;getDataStoreCounter<dataStore.length;getDataStoreCounter++){
var filter_ast = esprima.parse(createItrFilterTemplate);
estraverse.traverse(filter_ast, {
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

    //3. Add the if condition extracted from the return in previous part
    if(filter_node.type==="IfStatement")
      {
        filter_node.test=dataStore[getDataStoreCounter]["returnCondition"];
      }

    }
  });


  var storageVariable={};
  storageVariable=filter_ast;
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

          functionBody=node.body;

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
              if(typeOfOp=='filter')
              {

           nodelvl2.init= { "type": "Identifier","name": "newArray" };
           nodeChanged=true;

        }
       }
      }
     }
    }
    });


    //If the node is changed add the AST body before that
    if(nodeChanged)
    {
        if(templateStore[getFromTemplateStore])
        {
            console.log("Here Replacing Assignment at Root Operation");
          for(var astBody=templateStore[getFromTemplateStore].body.length-1;astBody>=0;astBody--)
          {
            functionBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
          }
          getFromTemplateStore++;
            nodeChanged=false;
        }

      //console.log(JSON.stringify(functionBody,null,4));
      //console.log("==========");
    }



    //For Assignment Expressions


    estraverse.traverse(checkNode, {
        enter: function(nodelvl2,parent2){
          if (nodelvl2.type === 'AssignmentExpression')
          {
            //console.log(JSON.stringify(currentfunctionAST,null,4));

            var typeOfOp='';
            if(nodelvl2.right.callee)
            {
              if(nodelvl2.right.callee.property)
              {

                typeOfOp=nodelvl2.right.callee.property.name;
              }
            }
            //Prints out Filter functions
            if(typeOfOp=='filter')
            {
              nodelvl2.right= { "type": "Identifier","name": "newArray" };
              nodeChanged=true;

      }
     }

  }
  });





    //If the node is changed add the AST body before that
    if(nodeChanged)
    {
        if(templateStore[getFromTemplateStore])
        {
            console.log("Here Replacing Call Expression Root Operation");
          for(var astBody=templateStore[getFromTemplateStore].body.length-1;astBody>=0;astBody--)
          {
            functionBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
          }
          getFromTemplateStore++;
            nodeChanged=false;
        }

      //console.log(JSON.stringify(functionBody,null,4));
      //console.log("==========");
    }

    //For Non Variable declarations

    estraverse.traverse(checkNode, {
        enter: function(nodelvl2,parent2){
            if(nodelvl2.type=="CallExpression")
            {
            //console.log(JSON.stringify(currentfunctionAST,null,4));

            var typeOfOp='';
            if(nodelvl2.callee)
            {
              if(nodelvl2.callee.property)
              {
                typeOfOp=nodelvl2.callee.property.name;
              }
            }
            //Prints out Filter functions
            if(typeOfOp=='filter')
            {

         nodelvl2.init= { "type": "Identifier","name": "newArray" };
         nodeChanged=true;

      }
     }
  }
  });



    //If the node is changed add the AST body before that
    if(nodeChanged)
    {
      console.log("Here 2");


        if(templateStore[getFromTemplateStore])
        {
            console.log("Replacing...With Root Iteration 2");

            for(var astBody=templateStore[getFromTemplateStore].body.length-1;astBody>=0;astBody--)
              {
                //console.log(JSON.stringify(templateStore[getFromTemplateStore].body[astBody],null,4));
                //console.log("==========");
                functionBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
              }
            getFromTemplateStore++;
              nodeChanged=false;
        }

      //console.log(JSON.stringify(functionBody,null,4));
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

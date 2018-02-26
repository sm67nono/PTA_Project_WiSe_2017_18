
//Static Analysis calls Here : smanna Dec 8, 2017
module.exports = {
  analyzeFilterFunctionExpressionCode:function(code) {
    // 1
    console.log("Tool Module: Filter Function Expression signatures");
    //Simple tool which searches if there is recursive functions traversing the AST and lists them out: smanna Dec 2, 2017
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
    var parentSign=null;

    //Could be moved to a database later
    var dataStore=[];
    var dataFormat={"parentSignature":parentSign,"bodySection":bodySection, "returnCondition":returnCondition, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};

	 var ast = esprima.parse(code);
	 //console.log("The AST is:");
	 //console.log(JSON.stringify(ast,null,4));
   estraverse.traverse(ast, {
     enter: function(currentfunctionAST,parentMain){
       //console.log(currentfunctionAST);
       //Extracting Filter functions
       //if (currentfunctionAST.type === 'FunctionDeclaration' || currentfunctionAST.type === 'FunctionExpression' || currentfunctionAST.type === 'Program')
       if (currentfunctionAST.type === 'FunctionExpression')
       {
         estraverse.traverse(currentfunctionAST, {
           enter: function(node,parentNode){
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

            console.log("Is using a  filter operation in Function");
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

                    //1. Getting the return section
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

                    //2. Getting the body section
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
                                //Uniquely identify the element in the parent
                                tempbody.length=tempbody.length-1;
                                var withoutReturnASTBody=tempbody;
                                bodySection=withoutReturnASTBody;

                                parentSign=parentNode;
                                //console.log(parentSign);
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
                        dataFormat={"parentSignature":parentSign,"bodySection":bodySection, "returnCondition":returnCondition, "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
                        dataStore.push(dataFormat);
                        extractedParts=1;
                        this.break();
                      }
                      //For conditions with no body or return condition
                      if(bodySectionFound==0 && returnSectionFound==0)
                      {
                        parentSign=parentNode;
                        dataFormat={"parentSignature":parentSign,"bodySection":'', "returnCondition":'', "arrayOperatedOn":arrayOperatedOn, "argVariableName":argVariableName};
                        dataStore.push(dataFormat);
                        extractedParts=1;
                        this.break();
                      }

                  }
                }
              });



              //Case 2: Filter Function external

          }
       }
     });
   }
 }
});
console.log("DataStore Length function Expressions",dataStore.length);
/*for(var counterDstore=0;counterDstore<dataStore.length;counterDstore++)
{
  console.log("Body Section");
  console.log(dataStore[counterDstore]["bodySection"]);
  console.log("ReturnCondition");
  console.log(dataStore[counterDstore]["returnCondition"]);
  console.log("arrayOperatedOn");
  console.log(dataStore[counterDstore]["arrayOperatedOn"]);
  console.log("Arg VariableName");
  console.log(dataStore[counterDstore]["argVariableName"]);
  console.log("================");
}*/

//console.log(functionNames);
//===================Substituting values into the template===========================

var createItrFilterTemplate = fs.readFileSync("filter_frame.js", 'utf-8');


//console.log(JSON.stringify(filter_ast,null,4));
//console.log("=================================");
var templateStore=[];
for(var getDataStoreCounter=0;getDataStoreCounter<dataStore.length;getDataStoreCounter++){
var filter_ast = esprima.parse(createItrFilterTemplate);
estraverse.traverse(filter_ast, {
  enter: function(filter_node)
  {
    //1. Add the body and the variable name used as args in map, reduce and filter operation
    if(filter_node.type==="ForStatement")
    {
      if(dataStore[getDataStoreCounter]["argVariableName"])
      {
        filter_node.body.body[0].declarations[0].id.name=dataStore[getDataStoreCounter]["argVariableName"];
      }
      for(var addbody=dataStore[getDataStoreCounter]["bodySection"].length-1;addbody>=0;addbody--)
        {
          filter_node.body.body.splice(1,0,dataStore[getDataStoreCounter]["bodySection"][addbody]);
        }
    }

    //2. Add the ArrayName which has the operation map,reduce,filter
    if(filter_node.type==="VariableDeclarator" && filter_node.id.name==="arrayUsingItr")
    {
      //filter_node.init.type="Identifier";
      filter_node.init=dataStore[getDataStoreCounter]["arrayOperatedOn"];
    }

    //3. Add the if condition extracted from the return in previous part
    if(filter_node.type==="IfStatement")
      {
        filter_node.test=dataStore[getDataStoreCounter]["returnCondition"];
      }

    }
  });

  //console.log(JSON.stringify(filter_ast,null,4));
  //console.log("======================");
  var storageVariable={};
  storageVariable=filter_ast;
  templateStore.push(storageVariable);
  //console.log(JSON.stringify(filter_ast,null,4));
  //console.log("===============================");
}

//console.log(JSON.stringify(filter_ast,null,4));

//Step 3: Replace the original AST having functional pattern

var getFromTemplateStore=0;

//For function declarations
estraverse.traverse(ast, {
    enter: function(node, parent){
    //console.log(currentfunctionAST);
    //By default the contents are inside the Root Node. So Program is the currentFunction

    //Mark the current function whose body has to be changed
    //For Non Variable declarations

    var functionBody=null;
    if(node.type === 'FunctionExpression')
    {
      //currentFunctionName=node.id.name;
      //Get the function body to change later
      if(node.body)
      {
        if(node.body.body)
        {
          functionBody=node.body.body;
        }
      }
      //console.log(JSON.stringify(functionBody,null,4));
    for(var loopCount=0;loopCount<functionBody.length;loopCount++)
    {
      var checkNode=functionBody[loopCount];
      var nodeChanged=false;
      //console.log(checkNode);
      //console.log("==================");

      //console.log("==================");
      var checkNodeBody=null;

      //Important for positioning the Converted Code
      if(checkNode.type==='FunctionExpression')
      {


          if(checkNode.body)
          {

            checkNodeBody=checkNode.body;
          }


      }

      //Important for positioning the Converted Code
      if(checkNode.type==='IfStatement')
      {

        if(checkNode.consequent)
        {

          if(checkNode.consequent.body)
          {

            checkNodeBody=checkNode.consequent.body;
          }
          else {
              checkNodeBody=checkNode.consequent;
          }
        }

      }




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
                if(dataStore[getFromTemplateStore]){
                if(parent2==dataStore[getFromTemplateStore].parentSignature)
                {
                  nodelvl2.init= { "type": "Identifier","name": "newArray" };
                  nodeChanged=true;
                }
                }

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
            console.log("Here Replacing Assignment Operation");
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
                if(dataStore[getFromTemplateStore]){
              if(parent2==dataStore[getFromTemplateStore].parentSignature)
              {
                nodelvl2.right= { "type": "Identifier","name": "newArray" };
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
            console.log("Here Replacing Assignment Operation");
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
    estraverse.replace(checkNode, {
        enter: function(nodelvl2,parent2){
            if(nodelvl2.type=="CallExpression")
            {
            //

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
              //console.log(dataStore[getFromTemplateStore].parentSignature);
              if(dataStore[getFromTemplateStore]){
                if(parent2==dataStore[getFromTemplateStore].parentSignature)
                {
                  //console.log(JSON.stringify(nodelvl2,null,4));
                  //console.log("===============Parent====================");
                  //console.log(JSON.stringify(parent2,null,4));


                  if(dataStore[getFromTemplateStore].arrayOperatedOn.type!="CallExpression")
                  {


                    //console.log("===============Array Operated ON====================");
                    //console.log(JSON.stringify(dataStore[getFromTemplateStore].arrayOperatedOn,null,4));
                    //console.log(dataStore[getFromTemplateStore].arrayOperatedOn.type);
                    for (var key in nodelvl2 ) {
                               nodelvl2[key] = null;
                       }

                    /*nodelvl2.type="ExpressionStatement";
                    nodelvl2.expression={};
                    nodelvl2.expression.type="AssignmentExpression";
                    nodelvl2.expression.operator="=";
                    nodelvl2.expression.left={};
                    nodelvl2.expression.left=dataStore[getFromTemplateStore].arrayOperatedOn;
                    nodelvl2.expression.right={};
                    nodelvl2.expression.right.type="Identifier";
                    nodelvl2.expression.right.name="newArray";*/

                    nodelvl2.type="Identifier";
                    nodelvl2.name="newArray";

                  for (var key in nodelvl2 ) {
                      if(nodelvl2[key] == null)
                      {
                        delete nodelvl2[key];
                      }
                    }
                }


                if(dataStore[getFromTemplateStore].arrayOperatedOn.type=="CallExpression")
                {

                  //console.log("===============Array Operated CallExpression====================");
                  //console.log(JSON.stringify(dataStore[getFromTemplateStore].arrayOperatedOn,null,4));
                  //console.log(dataStore[getFromTemplateStore].arrayOperatedOn.type);

                  //var copyValueArrayOperatedOn=JSON.parse(JSON.stringify(dataStore[getFromTemplateStore].arrayOperatedOn));
                  //copyValueArrayOperatedOn.arguments=[];
                  //copyValueArrayOperatedOn.arguments[0]={ "type": "Identifier","name": "newArray" };
                  //nodelvl2.type="ExpressionStatement";
                  //nodelvl2.expression={};
                  //nodelvl2.expression=copyValueArrayOperatedOn;

                  nodelvl2.type="Identifier";
                  nodelvl2.name="newArray";

                  for (var key in nodelvl2 ) {
                      if(nodelvl2[key] == null)
                      {
                        delete nodelvl2[key];
                      }
                    }

                }
                  nodeChanged=true;
          }
              }
             }

            }


         },
        /*leave: function(nodeleave) {
        console.log("===============Leaving Node====================");
        console.log(JSON.stringify(nodeleave,null,4));
      }*/
    });


    //If the node is changed add the AST body before that
    if(nodeChanged)
    {
      console.log("Here 2");

      if(checkNodeBody){
        //console.log("===================================CheckNode Body");
        //console.log(JSON.stringify(checkNodeBody,null,4));


      console.log("Here 2");
        if(templateStore[getFromTemplateStore])
        {
            console.log("Replacing...inside IFStatement Iteration 2");

            for(var astBody=0;astBody<templateStore[getFromTemplateStore].body.length;astBody++)
              {
                //console.log(JSON.stringify(templateStore[getFromTemplateStore].body[astBody],null,4));
                //console.log("==========");
                checkNodeBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
              }
            getFromTemplateStore++;
              nodeChanged=false;
        }
      }
      else {
        console.log("Replacing...inside Iteration 2");
        if(templateStore[getFromTemplateStore])
        {
        for(var astBody=templateStore[getFromTemplateStore].body.length-1;astBody>=0;astBody--)
          {
            //console.log(JSON.stringify(templateStore[getFromTemplateStore].body[astBody],null,4));
            //console.log("==========");
            functionBody.splice(loopCount,0, templateStore[getFromTemplateStore].body[astBody]);
          }
          getFromTemplateStore++;
          nodeChanged=false;
        }

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

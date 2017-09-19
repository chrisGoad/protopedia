<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="description" content="Visibility and Persistence for JavaScript's Prototype Realm">
<title>PrototypeJungle</title>
<link rel="stylesheet" type="text/css"  href="/style.css"> 
</head>
<body style="background-color:#eeeeee">


<div id="outerContainer>
  <div id="topbar">
     <div id="topbarOuter" style="padding-bottom:30px"><a href="/"><span class="mainTitle">PrototypeJungle</span></a>
        <img style ="position:relative;top:10px;border:none;left:-20px;" src="/images/logo.svg"  width="120" height="30"/>
        <div id = "topbarInner" style="position:relative;float:right;top:12px">           <a href="https://github.com/chrisGoad/prototypejungle/tree/firebase" class="ubutton">GitHub</a>
           <a href="/doc/tech.html">Docs</a>
           <a href="/doc/about.html" class="ubutton">About</a>
        </div>
    </div>
  </div>
  <div id="innerContainer" style="background-color:#eeeeee">


<!-- when fixing this doc for releaf, search for "PUTBACK" in this doc -->
<div style="text-align:center;font-size:14pt;padding-top:0px;color:black"><b>Deep Prototypes</b></div>
<!-- <div style="text-align:center;font-size:10pt;font-family:italic;color:black"><b>for maximizing adaptability</b></div>-->

<p>All of the visual components in PrototypeJungle, from drawing elements, through chart elements (eg axes), to complete charts, are
represented by   deep (that is, hierarchical)  JavaScript prototypes.</p>

<p>In normal JavaScript usage, the instantiation of a prototype 
(creation of a new object which inherits from the prototype) is a one-level operation, implemented by
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create">Object.create</a>
or <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new">new</a>.
PrototypeJungle
<a href="/doc/tech.html#instantiate">extends instantiation</a>
to hierarchical structures, so that
trees of arbitrary depth  serve  as templates from
which instances can be spawned at one blow.  </p>

<p>The structures in question may incorporate functions and internal
prototype chains.
<a href="https://en.wikipedia.org/wiki/Serialization">Serialization</a> is also
<a href = "/doc/tech.html#serialize">supported</a>.
 Together,
these capabilities  yield  a component system in which applications are built by instantiation and assembly
from stored elements. After instantiation, the components, being prototypes, are still "live" - that is,
any adjustments are inherited by instances. </p>

<p>The assemblies have a uniform structure which mates
well to a user interface in which prototype structure is exposed.
<span style="text-decoration: underline;font-weight:500">This yields applications of high adjustability</span> (the purpose of the enterprise).  </p>

<p>Here is diagram illustrating the component structure: </p>

 <img id="diagram" src="/images/prototree.svg"
      style="bborder:thin black solid;cursor:pointer"  width="950" height="250"/>
<p style="margin-top:-130px">
 The central requirement is that the structure<sup><a href="#footnote1">1</a></sup> be hierarchic in  its object-property-value aspect
 (the black and green subgraph).
 In the technical documentation, such a structure  is referred to, loosely but concisely, as a  "prototype tree"
 ("deep prototype" has equivalent meaning).<!--(<i>hierarchic prototype</i> is a little clearer, but a mouthful)-->
<a href="/doc/tech.html#prototypeTrees">Here</a> is a precise description</p>

<!--
<p>Complete application objects (eg charts) are themselves prototype trees, and as such have
a uniform structure which mates well with a uniform user interface. An initial stab at such an interface is the UI
seen in  the above example.-->
<!--However, the prototype-chain aspect is not relevant in every case to end-users.
A minor variant  of the inspector allows hiding of this aspect when irrelevant, or providing explanatory text
when it is. Click here to see the variant.--></p>
<!-- PUTBACK
<p>JavaScript libraries supporting the technology are available at this site (see the
<a href="doc/code.html">Coding Guide</a>), and all aspects of the implementation
are open source (at <a href="https://github.com/chrisGoad/prototypejungle/tree/r3">GitHub</a> under the MIT License).</p>-->
<!--
<p> An open drawing and charting application, in which visual elements and chart types could be
contributed by any web developer anywhere, is a possible application of the technology, which is at the proof-of-concept stage.</p>
-->

<div class="section" id="footnotes">Footnotes</div>

<p id="footnote1" style="font-size:small">1. Precisely stated: a red arrow runs from node a to
node b if Object.getPrototypeOf(a) === b. A black arrow runs from  a  to b  if a.P === b for some own property P of a.</p>
</div>
</div>
</body>
</html>
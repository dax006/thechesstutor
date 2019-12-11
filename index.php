             <?php 
             include("main.html");
             ?>
             <div id = "about" style="text-align:right;">
             
           <span style="font-size:x-small;"> <a href="about.html">About</a>		</span> 
           <?php
							// outputs e.g.  somefile.txt was last modified: December 29 2002 22:16:23.
							$filename = __FILE__;
							if (file_exists($filename)) {
							    echo "<span style='font-size:x-small;'> This page was last modified: " . date ("F d Y ", filemtime($filename)) . "</span>";
							}
						?>
					</div>
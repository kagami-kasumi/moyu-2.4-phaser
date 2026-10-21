import type {Shape} from '../content/slice-manifest.ts';

type Point=[number,number];
interface Segment {from:Point;to:Point;fill0:number;fill1:number;line:number}
const cache=new WeakMap<Shape,Segment[]>();
const middle=(first:Point,second:Point):Point=>[(first[0]+second[0])/2,(first[1]+second[1])/2];
function segments(shape:Shape){
 let result=cache.get(shape);if(result)return result;result=[];
 const split=(from:Point,control:Point,to:Point,style:Segment,depth=0)=>{
  const error=Math.hypot(control[0]-(from[0]+to[0])/2,control[1]-(from[1]+to[1])/2)/2;
  if(error<=.005||depth>=20){result!.push({...style,from,to});return;}
  const left=middle(from,control),right=middle(control,to),center=middle(left,right);
  split(from,left,center,style,depth+1);split(center,right,to,style,depth+1);
 };
 for(const edge of shape.segments??[]){if(edge.control)split(edge.from,edge.control,edge.to,edge);else result.push(edge);}
 cache.set(shape,result);return result;
}
export function shapeContains(shape:Shape,x:number,y:number){
 let inside=false;
 for(const edge of segments(shape)){
  const [ax,ay]=edge.from,[bx,by]=edge.to,dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
  const fraction=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;
  const distance=(x-ax-fraction*dx)**2+(y-ay-fraction*dy)**2;
  if(edge.line&&distance<=((shape.lines[edge.line-1]?.width??0)/2)**2)return true;
  if(Boolean(edge.fill0)!==Boolean(edge.fill1)){
   if(distance<1e-16)return true;
   if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }
 }
 return inside;
}

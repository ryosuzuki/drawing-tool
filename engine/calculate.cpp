#include <iostream>
#include <Eigen/Dense>
#include <Eigen/Sparse>

#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"

#include <math.h>
#include <igl/cotmatrix.h>
#include <igl/map_vertices_to_circle.h>

#include <igl/arap.h>
#include <igl/PI.h>
#include <igl/readOFF.h>
#include <igl/readDMAT.h>
#include <igl/deform_skeleton.h>



#include <igl/harmonic.h>
#include <igl/boundary_loop.h>
#include <igl/lscm.h>
#include <igl/arap.h>

using namespace std;
using namespace Eigen;
using namespace rapidjson;

MatrixXd V;
MatrixXi F;
MatrixXd N;
MatrixXd V_uv;
VectorXi bnd;

MatrixXd U;
VectorXi b;
VectorXi S;

MatrixXd initial_guess;
SparseMatrix<double> Lp;

extern "C" {
  // Compute necessary information to start using an ARAP deformation
  //
  // Inputs:
  //   V  #V by dim list of mesh positions
  //   F  #F by simplex-size list of triangle|tet indices into V
  //   dim  dimension being used at solve time. For deformation usually dim =
  //     V.cols(), for surface parameterization V.cols() = 3 and dim = 2
  //   b  #b list of "boundary" fixed vertex indices into V
  // Outputs:
  //   data  struct containing necessary precomputation

  // Inputs:
  //   bc  #b by dim list of boundary conditions
  //   data  struct containing necessary precomputation and parameters
  //   U  #V by dim initial guess

  int main() {
    igl::readOFF("./decimated-knight.off", V, F);
    igl::readDMAT("./decimated-knight-selection.dmat", S);

    U=V;

    igl::colon<int>(0,V.rows()-1,b);
    b.conservativeResize(stable_partition( b.data(), b.data()+b.size(),
     [](int i)->bool{return S(i)>=0;})-b.data());

    int dim = V.cols();
    igl::ARAPData data;
    data.max_iter = 100;
    data.energy = igl::ARAP_ENERGY_TYPE_SPOKES;
    igl::arap_precomputation(V, F, dim, b, data);
    // cout << data << endl;

    RowVector3d mid;
    mid = 0.5*(V.colwise().maxCoeff() + V.colwise().minCoeff());

    MatrixXd bc(b.size(), V.cols());
    double anim_t = 0.0;
    for(int i = 0; i<b.size(); i++) {
      bc.row(i) = V.row(b(i));
      switch(S(b(i)))　{
        case 0:
        {
          const double r = mid(0)*0.25;
          bc(i,0) += r*sin(0.5*anim_t*2.*igl::PI);
          bc(i,1) -= r+r*cos(igl::PI+0.5*anim_t*2.*igl::PI);
          break;
        }
        case 1:
        {
          const double r = mid(1)*0.15;
          bc(i,1) += r+r*cos(igl::PI+0.15*anim_t*2.*igl::PI);
          bc(i,2) -= r*sin(0.15*anim_t*2.*igl::PI);
          break;
        }
        case 2:
        {
          const double r = mid(1)*0.15;
          bc(i,2) += r+r*cos(igl::PI+0.35*anim_t*2.*igl::PI);
          bc(i,0) += r*sin(0.35*anim_t*2.*igl::PI);
          break;
        }
        default:
          break;
      }
    }
    igl::arap_solve(bc, data, U);
    cout << U << endl;
    return 0;
  }
}


  /*
  void getMapping(char *json, Result_Mapping *res) {
    Document d;
    d.Parse(json);

    Value &uniq  = d["uniq"];
    Value &faces = d["faces"];
    Value &map   = d["map"];
    Value &boundary = d["boundary"];

    V.resize(uniq.Size(), 3);
    F.resize(faces.Size(), 3);;
    N.resize(faces.Size(), 3);;
    bnd.resize(boundary.Size());;

    for (SizeType i=0; i<uniq.Size(); i++) {
      Value &vertex = uniq[i]["vertex"];
      V(i, 0) = vertex["x"].GetDouble();
      V(i, 1) = vertex["y"].GetDouble();
      V(i, 2) = vertex["z"].GetDouble();
    }
    for (SizeType i=0; i<faces.Size(); i++) {
      Value &face = faces[i];
      int a = face["a"].GetInt();
      int b = face["b"].GetInt();
      int c = face["c"].GetInt();
      F(i, 0) = map[a].GetInt();
      F(i, 1) = map[b].GetInt();
      F(i, 2) = map[c].GetInt();

      N(i, 0) = face["normal"]["x"].GetDouble();
      N(i, 1) = face["normal"]["y"].GetDouble();
      N(i, 2) = face["normal"]["z"].GetDouble();
    }
    for (SizeType i=0; i<boundary.Size(); i++) {
      bnd(i) = boundary[i].GetInt();
    }

    MatrixXd bnd_uv;
    igl::map_vertices_to_circle(V, bnd, bnd_uv);
    cout << bnd_uv << endl;
    igl::harmonic(V, F, bnd, bnd_uv, 1, initial_guess);

    // LSCM parametrization
    // VectorXi b(2, 1);
    // b(0) = bnd(0);
    // b(1) = bnd(round(bnd.size()/2));
    // cout << b << endl;
    // MatrixXd bc(2,2);
    // bc<<0,0,1,0;
    // igl::lscm(V, F, b, bc, V_uv);

    V_uv = initial_guess;
    // V_uv *= 0.5;

    cout << "Start ARAP calculation" << endl;
    igl::ARAPData arap_data;
    arap_data.with_dynamics = true;
    VectorXi b  = VectorXi::Zero(0);
    MatrixXd bc = MatrixXd::Zero(0, 0);

    // Initialize ARAP
    arap_data.max_iter = 100;
    // 2 means that we're going to *solve* in 2d
    arap_precomputation(V, F, 2, b, arap_data);
    // Solve arap using the harmonic map as initial guess
    V_uv = initial_guess;
    arap_solve(bc, arap_data, V_uv);
    // Scale UV to make the texture more clear
    V_uv *= 0.5;

    cout << "Get V_uv with ARAP" << endl;
    cout << V_uv << endl;
    int nRow = V_uv.rows();
    int nCol = V_uv.cols();
    res->uv = new double[nRow * nCol];
    for (int i=0; i<nRow; i++) {
      for (int j=0; j<nCol; j++) {
        double val = V_uv(i, j) + 0.5;
        res->uv[nCol * i + j] = val;
      }
    }
  }
  */



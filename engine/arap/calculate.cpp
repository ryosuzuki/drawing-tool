#include <iostream>
#include <Eigen/Dense>
#include <Eigen/Sparse>

#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"

#include <igl/readOBJ.h>
#include <igl/arap.h>
#include <igl/arap_dof.h>

using namespace std;
using namespace Eigen;
using namespace rapidjson;

MatrixXd V;
MatrixXi F;
MatrixXd U;
igl::ARAPData arap_data;
igl::ARAPData arap_grouped_data;
igl::ArapDOFData<Eigen::MatrixXd,double> arap_dof_data;

extern "C" {
  typedef struct {
    double *positions;
  } Result_Vertices;

  void getDeformation(char *json, Result_Vertices *res) {
    Document d;
    d.Parse(json);

    cout << "Get Deformatioin" << endl;
    const char *filename = d["filename"].GetString();
    igl::readOBJ(filename, V, F);
    U = V;

    Value &b_index = d["b_index"];
    Value &b_positions = d["b_positions"];
    int n = b_index.Size();
    VectorXi b = VectorXi::Zero(n);
    MatrixXd bc(b.size(), V.cols());

    VectorXi G = VectorXi::Zero(V.rows());

    int j = 1;
    for (SizeType i=0; i<n; i++) {
      b(i) = b_index[i].GetInt();
      bc(i, 0) = b_positions[i]["x"].GetDouble();
      bc(i, 1) = b_positions[i]["y"].GetDouble();
      bc(i, 2) = b_positions[i]["z"].GetDouble();

      G(b(i)) = j;
      j++;
    }


    cout << "Start precomputation" << endl;
    arap_data.max_iter = 5;
    igl::arap_precomputation(V, F, V.cols(), b, arap_data);

    // igl::arap_dof_precomputation(V, F, M, G, arap_dof_data);
    arap_grouped_data.max_iter = 2;
    arap_grouped_data.G = G;
    // igl::arap_precomputation(V, F, V.cols(), b, arap_grouped_data);

    cout << "Finish precomputation" << endl;

    cout << "Start compute" << endl;
    igl::arap_solve(bc, arap_data, U);
    // igl::arap_solve(bc, arap_grouped_data, U);
    cout << "Finish compute" << endl;

    // cout << U << endl;
    for (int i=0; i<U.rows(); i++) {
      res->positions[3*i] = U(i, 0);
      res->positions[3*i+1] = U(i, 1);
      res->positions[3*i+2] = U(i, 2);
    }
  }

}


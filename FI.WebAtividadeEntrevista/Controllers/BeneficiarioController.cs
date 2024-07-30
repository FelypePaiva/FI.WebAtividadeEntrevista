using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;
using System.Net;

namespace WebAtividadeEntrevista.Controllers
{
    public class BeneficiarioController : Controller
    {

        [HttpPost]
        public JsonResult Incluir(BeneficiarioModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();


            if (!this.ModelState.IsValid)
            {
                List<string> errosObjects = (from item in ModelState
                                             where item.Value.Errors.Count() > 0
                                             select "Erro no campo " +
                                                 item.Key.ToString() + " - " +
                                                 item.Value.Errors.First().ErrorMessage.ToString())
                                                         .ToList();

                Response.StatusCode = 400;
                return Json(string.Join("<br><hr>", errosObjects));
            }
            else
            {
                if (boBeneficiario.VerificarExistencia(model.CPF,model.IdCliente))
                {
                    Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return Json("Já Existe um usuario com o CPF inserido!!");
                }

                model.Id = boBeneficiario.Incluir(new Beneficiario()
                {
                    Nome = model.Nome,
                    CPF = model.CPF,
                    IdCliente = model.IdCliente
                });

                
                return Json(new { Mensagem = "Cadastro efetuado com sucesso", idNovoRegistro = model.Id });
            }
        }


        [HttpPost]
        public JsonResult Alterar(BeneficiarioModel model)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();


            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(string.Join(Environment.NewLine, erros));
            }
            else
            {
                Beneficiario Beneficiario = boBeneficiario.Consultar(model.Id);

                if (Beneficiario != null && Beneficiario.CPF != model.CPF)
                {
                    //Verifica se existe outro CPF igual no sistema
                    if (boBeneficiario.VerificarExistencia(model.CPF, model.IdCliente))
                    {
                        Response.StatusCode = (int)HttpStatusCode.BadRequest;
                        return Json("Já Existe um usuario com o CPF inserido!!");
                    }
                }

                boBeneficiario.Alterar(new Beneficiario()
                {
                    Id = model.Id,
                    Nome = model.Nome,
                    CPF = model.CPF,
                    IdCliente = model.IdCliente
                });


                return Json(new { Mensagem = "Cadastro alterado com sucesso" });
            }
        }


        [HttpPost]
        public JsonResult Deletar(long id = 0)
        {
            BoCliente bo = new BoCliente();
            BoBeneficiario boBeneficiario = new BoBeneficiario();


            if (id == 0)
            {
                Response.StatusCode = 400;
                return Json("Erro ao receber id do registro a remover");
            }
            else
            {
                boBeneficiario.Excluir(id);

                return Json("Cadastro alterado com sucesso");
            }
        }
    }
}
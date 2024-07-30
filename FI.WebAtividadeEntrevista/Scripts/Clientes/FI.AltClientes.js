
$(document).ready(function () {
    $('.cpf').mask('000.000.000-00', { reverse: true });
    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #CPF').val($('.cpf').masked(obj.CPF));
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);

        if (obj.Beneficiarios) {
            for (let beneficiario of obj.Beneficiarios) {
                let cpf = $('.cpf').masked(beneficiario.CPF);
                AdicionarElementoListagem(`<tr data-id="${beneficiario.Id}"><td class="beneficiarioCPF">${cpf}</td><td class="beneficiarioNome">${beneficiario.Nome}</td><td><button class="btn btn-primary btnEditarBeneficiario">Alterar</button><button class="btn btn-primary btnExcluirBeneficiario">Excluir</button></td></tr>`);

            }
        }
    }

    $('#formCadastro').submit(function (e) {
        e.preventDefault();
        
        $.ajax({
            url: urlPost,
            method: "POST",
            data: {
                "NOME": $(this).find("#Nome").val(),
                "CEP": $(this).find("#CEP").val(),
                "CPF": $(this).find("#CPF").val().replaceAll('.','').replaceAll('-',''),
                "Email": $(this).find("#Email").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Telefone": $(this).find("#Telefone").val()
            },
            error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON);
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
            success:
            function (r) {
                ModalDialog("Sucesso!", r)
                $("#formCadastro")[0].reset();                                
                window.location.href = urlRetorno;
            }
        });
    })
    $('#FormCadastroBeneficiario').submit(function (e) {
        e.preventDefault();
        let acao = $("#btn-incluir").data('acao');
        let beneficiarioNome = $('#BeneficiarioNome').val();
        let beneficiarioCPF = $('#BeneficiarioCPF').val();
        if (acao == 'Incluir') {
            if (!existeMesmoCPFNaLista(beneficiarioCPF.replaceAll('.', '').replaceAll('-', ''))) {
                $.ajax({
                    url: urlIncluir,
                    method: "POST",
                    data: {
                        "IdCliente": obj.Id,
                        "Nome": beneficiarioNome,
                        "CPF": beneficiarioCPF.replaceAll('.', '').replaceAll('-', '')
                    },
                    error:
                        function (r) {
                            if (r.status == 400)
                                ModalDialog("Ocorreu um erro", r.responseJSON);
                            else if (r.status == 500)
                                ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                        },
                    success:
                        function (r) {
                            ModalDialog("Sucesso!", r.Mensagem)
                            IncluirBeneficiario(beneficiarioNome, beneficiarioCPF, r.idNovoRegistro);
                            //window.location.href = urlRetorno;
                        }
                });

            } else {
                ModalDialog("Ocorreu um erro", "Não é possivel Cadastrar este CPF pois ele já está presente na Lista!!!");
            }

        } else if (acao == 'Alterar') {
            if (!existeMesmoCPFNaLista(beneficiarioCPF.replaceAll('.', '').replaceAll('-', ''))) {
                $.ajax({
                    url: urlAlter,
                    method: "POST",
                    data: {
                        "Id": elementoParaAlterar.getAttribute('data-id'),
                        "IdCliente": obj.Id,
                        "Nome": beneficiarioNome,
                        "CPF": beneficiarioCPF.replaceAll('.', '').replaceAll('-', '')
                    },
                    error:
                        function (r) {
                            if (r.status == 400)
                                ModalDialog("Ocorreu um erro", r.responseJSON);
                            else if (r.status == 500)
                                ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                        },
                    success:
                        function (r) {
                            ModalDialog("Sucesso!", r.Mensagem)
                            AlterarBeneficiario();
                            AlternarEvendoDeInclusaoOuAlteracao('Incluir')
                            elementoParaAlterar.style.backgroundColor = "#fff";
                            $('#BeneficiarioNome').val('');
                            $('#BeneficiarioCPF').val('');

                        }
                });
            } else {
                ModalDialog("Ocorreu um erro", "Não é possivel Cadastrar este CPF pois ele já está presente na Lista!!!");
            }

        }
    })
    $('#btnModalBeneficiarios').on('click', function () {
        AlternarEvendoDeInclusaoOuAlteracao('Incluir');
        if (elementoParaAlterar != null) elementoParaAlterar.style.backgroundColor = "#fff";
        $("#FormularioBeneficiario").modal('show');
    })
    $('.btnExcluirBeneficiario').off().on('click', function (e) {
        ExcluirElemento($(this).parent().parent());
    })
    $('.btnEditarBeneficiario').off().on('click', function (e) {
        let elementoAlterar = BuscarDadosAlteracaoBeneficiario($(this).parent().parent());

    })
})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}

function IncluirBeneficiario(nome, cpf, idNovoRegistro = 0) {
    let dataid = (idNovoRegistro != 0 ? 'data-id="' + idNovoRegistro + '"' : '');
    cpf = $('.cpf').masked(cpf);
    AdicionarElementoListagem(`<tr ${dataid}><td class="beneficiarioCPF">${cpf}</td><td class="beneficiarioNome">${nome}</td><td><button class="btn btn-primary btnEditarBeneficiario">Alterar</button><button class="btn btn-primary btnExcluirBeneficiario">Excluir</button></td></tr>`);
}
function AdicionarElementoListagem(elemento) {
    //Cria elemento e adiciona como primeiro item da lista da tabela
    if ($('#TabelaBeneficiario tbody tr').length > 0) {
        $('#TabelaBeneficiario tbody tr').first().before(elemento);
    } else {
        $('#TabelaBeneficiario tbody').append(elemento);
    }
    //Adiciona Evento de click no novo elemento
    $('.btnExcluirBeneficiario').off().on('click', function (e) {
        ExcluirElemento($(this).parent().parent());
    })
    $('.btnEditarBeneficiario').off().on('click', function (e) {
        BuscarDadosAlteracaoBeneficiario($(this).parent().parent());
    })

}

//Lista novos Beneficiarios, indicados pela ausencia do atributo data-id na linha da tabela
function listarNovosBeneficiarios() {
    return $('#TabelaBeneficiario tbody tr').not('[data-id]');
}

function listarNovosBeneficiariosArrayObjects() {
    debugger;
    let elementos = listarNovosBeneficiarios();

    let retorno = [];
    if (elementos) {
        for (let item of elementos) {
            retorno.push({ Nome: item.querySelector('.beneficiarioNome').textContent, CPF: item.querySelector('.beneficiarioCPF').textContent });
        }
        return retorno;
    }
}


function listarTodosBeneficiarios() {
    return $('#TabelaBeneficiario tbody tr');
}

function listarTodosBeneficiariosArrayObjects() {
    let elementos = listarTodosBeneficiarios();

    let retorno = [];
    if (elementos) {
        for (let item of elementos) {
            retorno.push({ Nome: item.querySelector('.beneficiarioNome').textContent, CPF: item.querySelector('.beneficiarioCPF').textContent.replaceAll('.', '').replaceAll('-', '') });
        }
        return retorno;
    }
}

function existeMesmoCPFNaLista(cpf) {
    debugger;
    let lista = listarTodosBeneficiariosArrayObjects();
    if (lista != null && lista.length > 0) {
        let retorno = lista.find((el) => el.CPF == cpf);
        if (retorno != null && retorno != undefined) {
            return true;
        }
        return false;
    }
    return false;
}

function ExcluirElemento(el) {
    $.ajax({
        url: urlDelete,
        method: "POST",
        data: {
            "id": el.data('id')
        },
        error:
            function (r) {
                if (r.status == 400)
                    ModalDialog("Ocorreu um erro", r.responseJSON);
                else if (r.status == 500)
                    ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
            },
        success:
            function (r) {
                ModalDialog("Sucesso!", r)
            }
    });
    RemoverBeneficiarioTabela(el)
}
function RemoverBeneficiarioTabela(el) {
    el.remove();
}


function AlterarBeneficiario() {
    elementoParaAlterar.querySelector('.beneficiarioNome').textContent = $('#BeneficiarioNome').val();
    elementoParaAlterar.querySelector('.beneficiarioCPF').textContent = $('.cpf').masked($('#BeneficiarioCPF').val());
}
var elementoParaAlterar = null;
function BuscarDadosAlteracaoBeneficiario(el) {
    el = el[0];
    $('#BeneficiarioNome').val(el.querySelector('.beneficiarioNome').textContent);
    $('#BeneficiarioCPF').val($('.cpf').masked(el.querySelector('.beneficiarioCPF').textContent));
    AlternarEvendoDeInclusaoOuAlteracao('Alterar')
    elementoParaAlterar = el;
    elementoParaAlterar.style.backgroundColor = "#c8c8fa";
}
function AlternarEvendoDeInclusaoOuAlteracao(acao) {
    $("#btn-incluir").data('acao', acao);
    $("#btn-incluir").text(acao);
}